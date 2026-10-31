// Crear, cancelar y registrar la llegada de una reserva.
//
// Estados que ve el usuario (se calculan, no se guardan):
// - pendiente:    activa, sin "Llegué" y todavía dentro de hora + tolerancia.
// - llegada:      apretó "Llegué" antes de que termine la tolerancia.
// - llegada_tarde: apretó "Llegué" después de la tolerancia.
// - no_llego:     pasó la tolerancia sin "Llegué". Es sólo informativo: no hay penalidad
//                 y el lugar no se libera (ambas cosas están fuera del scope del MVP).
// - cancelada
const config = require('../config');
const { transaccion } = require('../db/db');
const { MIN, aEpoch, partesLocales } = require('./tiempo');
const { opcionesReserva } = require('./disponibilidad');
const { registrarEvento } = require('./eventos');

class ErrorReserva extends Error {}

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

function reservaPendiente(db, usuarioId, ahoraMs, cfg = config) {
  const activas = db
    .prepare(
      `SELECT * FROM reservas WHERE usuario_id = ? AND estado = 'activa' AND llegada_registrada_en IS NULL
       ORDER BY fecha, hora`
    )
    .all(usuarioId);
  return activas.find((r) => estadoReserva(r, ahoraMs, cfg) === 'pendiente') || null;
}

// La reserva que se muestra en Inicio y en "Ver mi reserva": la pendiente o, si no hay,
// la última de hoy (ya usada o vencida) para poder mostrar su estado.
function reservaActual(db, usuarioId, ahoraMs, cfg = config) {
  const pendiente = reservaPendiente(db, usuarioId, ahoraMs, cfg);
  if (pendiente) return pendiente;
  return (
    db
      .prepare(
        `SELECT * FROM reservas WHERE usuario_id = ? AND estado = 'activa' AND fecha = ?
         ORDER BY hora DESC, id DESC LIMIT 1`
      )
      .get(usuarioId, partesLocales(ahoraMs).fecha) || null
  );
}

function buscarPropia(db, usuarioId, reservaId) {
  const r = db.prepare('SELECT * FROM reservas WHERE id = ? AND usuario_id = ?').get(reservaId, usuarioId);
  if (!r) throw new ErrorReserva('No encontramos esa reserva.');
  return r;
}

function crearReserva(db, usuarioId, fecha, hora, ahoraMs = Date.now(), cfg = config) {
  return transaccion(db, () => {
    if (reservaPendiente(db, usuarioId, ahoraMs, cfg)) {
      throw new ErrorReserva('Ya tenés una reserva activa. Para hacer otra, primero cancelá la que tenés.');
    }
    const opcion = opcionesReserva(db, ahoraMs, cfg)
      .find((o) => o.fecha === fecha)
      ?.horas.find((h) => h.hora === hora);
    if (!opcion) {
      throw new ErrorReserva('Ese horario ya no tiene lugares libres. Elegí otro, por favor.');
    }
    const { lastInsertRowid } = db
      .prepare('INSERT INTO reservas (usuario_id, fecha, hora, creada_en) VALUES (?, ?, ?, ?)')
      .run(usuarioId, fecha, hora, new Date(ahoraMs).toISOString());
    registrarEvento(db, usuarioId, 'reserva_creada', `${fecha} ${hora}`, ahoraMs);
    return Number(lastInsertRowid);
  });
}

function cancelarReserva(db, usuarioId, reservaId, ahoraMs = Date.now(), cfg = config) {
  return transaccion(db, () => {
    const r = buscarPropia(db, usuarioId, reservaId);
    if (!puedeCancelar(r, ahoraMs, cfg)) {
      throw new ErrorReserva('Esta reserva ya no se puede cancelar.');
    }
    db.prepare("UPDATE reservas SET estado = 'cancelada', cancelada_en = ? WHERE id = ?").run(
      new Date(ahoraMs).toISOString(),
      r.id
    );
    registrarEvento(db, usuarioId, 'reserva_cancelada', `${r.fecha} ${r.hora}`, ahoraMs);
  });
}

function registrarLlegada(db, usuarioId, reservaId, ahoraMs = Date.now(), cfg = config) {
  return transaccion(db, () => {
    const r = buscarPropia(db, usuarioId, reservaId);
    if (!puedeRegistrarLlegada(r, ahoraMs, cfg)) {
      throw new ErrorReserva('Todavía no podés registrar la llegada para esta reserva.');
    }
    db.prepare('UPDATE reservas SET llegada_registrada_en = ? WHERE id = ?').run(new Date(ahoraMs).toISOString(), r.id);
    const minutos = Math.round((ahoraMs - aEpoch(r.fecha, r.hora)) / MIN);
    registrarEvento(db, usuarioId, 'llegue', `${r.fecha} ${r.hora} (${minutos >= 0 ? '+' : ''}${minutos} min)`, ahoraMs);
  });
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
