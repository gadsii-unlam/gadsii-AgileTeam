// Componente propio del MVP: qué turnos se pueden reservar y cuántos lugares quedan en cada uno.
//
// Reglas (acordadas con el equipo):
// - Un único estacionamiento. Se reserva por turno de llegada; los turnos de cada día están en
//   parametros.json (por defecto 08:00, 14:00 y 19:00 de lunes a viernes; 08:00 y 14:00 los
//   sábados; domingos cerrado).
// - Cada turno tiene su propio cupo de `capacidad` lugares (o el cupo propio que le dé
//   parametros.json), que ocupan sólo las reservas activas de ese turno (llegue o no la persona:
//   no hay liberación por vencimiento).
// - Un turno se puede reservar hasta su hora de inicio (o hasta `anticipacionMin` minutos antes,
//   por defecto 0) y hasta `ventanaHoras` desde ahora (por defecto 24). Desaparece al empezar o al
//   quedarse sin lugares, y vuelve a aparecer si alguien cancela.
// - Un usuario no ve en las opciones los turnos en los que ya tiene una reserva activa (haya
//   registrado o no la llegada); si la cancela, el turno le vuelve a aparecer.
const config = require('../config');
const { todas } = require('../db/db');
const { MIN, aEpoch, partesLocales, sumarDias, etiquetaFecha } = require('./tiempo');

const diaSemana = (fecha) => partesLocales(aEpoch(fecha, '12:00')).diaSemana;

function turnosDelDia(fecha, cfg = config) {
  return cfg.turnos[diaSemana(fecha)];
}

// Lugares del turno: su cupo propio si lo tiene en parametros.json, si no `capacidad`.
function cuposDelTurno(fecha, hora, cfg = config) {
  return cfg.cupos?.[diaSemana(fecha)]?.[hora] ?? cfg.capacidad;
}

// Fechas desde hoy que puede alcanzar la ventana de reserva.
function fechasEnVentana(ahoraMs, cfg) {
  const hoy = partesLocales(ahoraMs).fecha;
  return Array.from({ length: Math.ceil(cfg.ventanaHoras / 24) + 1 }, (_, i) => sumarDias(hoy, i));
}

function turnosEnVentana(ahoraMs, cfg = config) {
  const desde = ahoraMs + cfg.anticipacionMin * MIN;
  const hasta = ahoraMs + cfg.ventanaHoras * 60 * MIN;
  const turnos = [];
  for (const fecha of fechasEnVentana(ahoraMs, cfg)) {
    for (const hora of turnosDelDia(fecha, cfg)) {
      const inicioMs = aEpoch(fecha, hora);
      if (inicioMs >= desde && inicioMs <= hasta) turnos.push({ fecha, hora, inicioMs });
    }
  }
  return turnos;
}

// Primer turno que todavía no se puede reservar por estar a más de 24 h, y desde cuándo se puede.
// Sirve para avisar, por ejemplo un sábado a la noche, cuándo se habilita el turno del lunes.
function proximoTurnoFueraDeVentana(ahoraMs, cfg = config) {
  const hasta = ahoraMs + cfg.ventanaHoras * 60 * MIN;
  let fecha = partesLocales(ahoraMs).fecha;
  for (let i = 0; i < Math.ceil(cfg.ventanaHoras / 24) + 8; i++, fecha = sumarDias(fecha, 1)) {
    for (const hora of turnosDelDia(fecha, cfg)) {
      const inicioMs = aEpoch(fecha, hora);
      if (inicioMs > hasta) return { fecha, hora, inicioMs, reservableDesdeMs: inicioMs - cfg.ventanaHoras * 60 * MIN };
    }
  }
  return null;
}

async function reservasPorTurno(db, fechas) {
  const filas = await todas(
    db,
    `SELECT fecha, hora, COUNT(*) AS cantidad FROM reservas
     WHERE estado = 'activa' AND fecha IN (${fechas.map(() => '?').join(',')})
     GROUP BY fecha, hora`,
    fechas
  );
  return new Map(filas.map((f) => [`${f.fecha} ${f.hora}`, Number(f.cantidad)]));
}

// Todos los turnos de la ventana, incluidos los llenos.
async function disponibilidad(db, ahoraMs, cfg = config) {
  const turnos = turnosEnVentana(ahoraMs, cfg);
  if (turnos.length === 0) return [];
  const reservas = await reservasPorTurno(db, [...new Set(turnos.map((t) => t.fecha))]);
  return turnos.map((t) => ({
    ...t,
    libres: Math.max(0, cuposDelTurno(t.fecha, t.hora, cfg) - (reservas.get(`${t.fecha} ${t.hora}`) || 0)),
  }));
}

// Turnos ("fecha hora") en los que el usuario tiene una reserva activa.
async function turnosReservados(db, usuarioId, fechas) {
  const filas = await todas(
    db,
    `SELECT fecha, hora FROM reservas
     WHERE usuario_id = ? AND estado = 'activa' AND fecha IN (${fechas.map(() => '?').join(',')})`,
    [usuarioId, ...fechas]
  );
  return new Set(filas.map((f) => `${f.fecha} ${f.hora}`));
}

// Sólo lo que se puede elegir (H4): días con al menos un turno libre y turnos con lugares libres.
// Si se indica el usuario, se omiten los turnos que ya tiene reservados.
async function opcionesReserva(db, ahoraMs, cfg = config, usuarioId = null) {
  const turnos = await disponibilidad(db, ahoraMs, cfg);
  const propios =
    usuarioId && turnos.length > 0 ? await turnosReservados(db, usuarioId, [...new Set(turnos.map((t) => t.fecha))]) : new Set();
  const porFecha = new Map();
  for (const t of turnos) {
    if (t.libres === 0 || propios.has(`${t.fecha} ${t.hora}`)) continue;
    if (!porFecha.has(t.fecha)) {
      porFecha.set(t.fecha, { fecha: t.fecha, etiqueta: etiquetaFecha(t.fecha, ahoraMs), horas: [] });
    }
    porFecha.get(t.fecha).horas.push({ hora: t.hora, libres: t.libres });
  }
  return [...porFecha.values()];
}

module.exports = { turnosDelDia, cuposDelTurno, turnosEnVentana, proximoTurnoFueraDeVentana, disponibilidad, opcionesReserva };
