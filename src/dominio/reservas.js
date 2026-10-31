// Crear, cancelar y registrar la llegada de una reserva.
//
// Estados que ve el usuario (se calculan, no se guardan):
// - pendiente:    activa, sin "Llegué" y todavía dentro de hora + tolerancia.
// - llegada:      apretó "Llegué" antes de que termine la tolerancia.
// - llegada_tarde: apretó "Llegué" después de la tolerancia.
// - no_llego:     pasó la tolerancia sin "Llegué". Es sólo informativo: no hay penalidad
//                 y el lugar no se libera (ambas cosas están fuera del scope del MVP).
// - cancelada
//
// Concurrencia: en Netlify pueden atender varias instancias a la vez contra la misma base.
// Por eso cada escritura es UNA sentencia SQL que incluye sus propias condiciones (cupo,
// reserva pendiente, estado). SQLite ejecuta cada sentencia de forma atómica y las escrituras
// de a una, así que dos pedidos simultáneos nunca pueden tomar el mismo último lugar.
const config = require('../config');
const { una, todas, ejecutar } = require('../db/db');
const { MIN, aEpoch, partesLocales } = require('./tiempo');
const { turnosEnVentana } = require('./disponibilidad');
const { registrarEvento } = require('./eventos');

class ErrorReserva extends Error {}

// Modificador de SQLite para pasar fecha/hora de Argentina a UTC (ej. "+180 minutes").
const [, signo, hh, mm] = config.offsetUtc.match(/([+-])(\d{2}):(\d{2})/);
const A_UTC = `${signo === '-' ? '+' : '-'}${Number(hh) * 60 + Number(mm)} minutes`;
// Segundos epoch del inicio del turno de una reserva, calculado en SQL.
const INICIO_SQL = `unixepoch(fecha || ' ' || hora, '${A_UTC}')`;

const segundos = (ms) => ms / 1000;

function estadoReserva(r, ahoraMs, cfg = config) {
  if (r.estado === 'cancelada') return 'cancelada';
  const limiteMs = aEpoch(r.fecha, r.hora) + cfg.toleranciaMin * MIN;
  if (r.llegada_registrada_en) {
    return Date.parse(r.llegada_registrada_en) <= limiteMs ? 'llegada' : 'llegada_tarde';
  }
  return ahoraMs <= limiteMs ? 'pendiente' : 'no_llego';
}

function puedeCancelar(r, ahoraMs, cfg = config) {
  return estadoReserva(r, ahoraMs, cfg) === 'pendiente';
}

// "Llegué" se habilita desde un rato antes de la hora reservada y hasta el fin de ese día.
function puedeRegistrarLlegada(r, ahoraMs, cfg = config) {
  if (r.estado !== 'activa' || r.llegada_registrada_en) return false;
  if (partesLocales(ahoraMs).fecha !== r.fecha) return false;
  return ahoraMs >= aEpoch(r.fecha, r.hora) - cfg.llegueDesdeMin * MIN;
}

async function reservaPendiente(db, usuarioId, ahoraMs, cfg = config) {
  const activas = await todas(
    db,
    `SELECT * FROM reservas WHERE usuario_id = ? AND estado = 'activa' AND llegada_registrada_en IS NULL
     ORDER BY fecha, hora`,
    [usuarioId]
  );
  return activas.find((r) => estadoReserva(r, ahoraMs, cfg) === 'pendiente') || null;
}

// La reserva que se muestra en Inicio y en "Ver mi reserva": la pendiente o, si no hay,
// la última de hoy (ya usada o vencida) para poder mostrar su estado.
async function reservaActual(db, usuarioId, ahoraMs, cfg = config) {
  const pendiente = await reservaPendiente(db, usuarioId, ahoraMs, cfg);
  if (pendiente) return pendiente;
  return una(
    db,
    `SELECT * FROM reservas WHERE usuario_id = ? AND estado = 'activa' AND fecha = ?
     ORDER BY hora DESC, id DESC LIMIT 1`,
    [usuarioId, partesLocales(ahoraMs).fecha]
  );
}

async function crearReserva(db, usuarioId, fecha, hora, ahoraMs = Date.now(), cfg = config) {
  if (!turnosEnVentana(ahoraMs, cfg).some((t) => t.fecha === fecha && t.hora === hora)) {
    throw new ErrorReserva('Ese turno ya no está disponible. Elegí otro, por favor.');
  }
  // Se inserta sólo si hay cupo en el turno y el usuario no tiene otra reserva pendiente.
  const { cambios, id } = await ejecutar(
    db,
    `INSERT INTO reservas (usuario_id, fecha, hora, creada_en)
     SELECT ?1, ?2, ?3, ?4
     WHERE (SELECT COUNT(*) FROM reservas WHERE fecha = ?2 AND hora = ?3 AND estado = 'activa') < ?5
       AND NOT EXISTS (
         SELECT 1 FROM reservas
         WHERE usuario_id = ?1 AND estado = 'activa' AND llegada_registrada_en IS NULL
           AND ${INICIO_SQL} + ?6 >= ?7)`,
    [usuarioId, fecha, hora, new Date(ahoraMs).toISOString(), cfg.capacidad, cfg.toleranciaMin * 60, segundos(ahoraMs)]
  );
  if (cambios === 0) {
    if (await reservaPendiente(db, usuarioId, ahoraMs, cfg)) {
      throw new ErrorReserva('Ya tenés una reserva activa. Para hacer otra, primero cancelá la que tenés.');
    }
    throw new ErrorReserva('Ese turno ya no tiene lugares libres. Elegí otro, por favor.');
  }
  await registrarEvento(db, usuarioId, 'reserva_creada', `${fecha} ${hora}`, ahoraMs);
  return id;
}

async function cancelarReserva(db, usuarioId, reservaId, ahoraMs = Date.now(), cfg = config) {
  const r = await una(
    db,
    `UPDATE reservas SET estado = 'cancelada', cancelada_en = ?3
     WHERE id = ?1 AND usuario_id = ?2 AND estado = 'activa' AND llegada_registrada_en IS NULL
       AND ${INICIO_SQL} + ?4 >= ?5
     RETURNING fecha, hora`,
    [reservaId, usuarioId, new Date(ahoraMs).toISOString(), cfg.toleranciaMin * 60, segundos(ahoraMs)]
  );
  if (!r) throw new ErrorReserva('Esta reserva ya no se puede cancelar.');
  await registrarEvento(db, usuarioId, 'reserva_cancelada', `${r.fecha} ${r.hora}`, ahoraMs);
}

async function registrarLlegada(db, usuarioId, reservaId, ahoraMs = Date.now(), cfg = config) {
  const r = await una(
    db,
    `UPDATE reservas SET llegada_registrada_en = ?3
     WHERE id = ?1 AND usuario_id = ?2 AND estado = 'activa' AND llegada_registrada_en IS NULL
       AND fecha = ?4 AND ${INICIO_SQL} - ?5 <= ?6
     RETURNING fecha, hora`,
    [reservaId, usuarioId, new Date(ahoraMs).toISOString(), partesLocales(ahoraMs).fecha, cfg.llegueDesdeMin * 60, segundos(ahoraMs)]
  );
  if (!r) throw new ErrorReserva('Todavía no podés registrar la llegada para esta reserva.');
  const minutos = Math.round((ahoraMs - aEpoch(r.fecha, r.hora)) / MIN);
  await registrarEvento(db, usuarioId, 'llegue', `${r.fecha} ${r.hora} (${minutos >= 0 ? '+' : ''}${minutos} min)`, ahoraMs);
}

module.exports = {
  ErrorReserva,
  estadoReserva,
  puedeCancelar,
  puedeRegistrarLlegada,
  reservaPendiente,
  reservaActual,
  crearReserva,
  cancelarReserva,
  registrarLlegada,
};
