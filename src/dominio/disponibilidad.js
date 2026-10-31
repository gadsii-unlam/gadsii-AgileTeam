// Componente propio del MVP: qué turnos se pueden reservar y cuántos lugares quedan en cada uno.
//
// Reglas (acordadas con el equipo):
// - Un único estacionamiento. Se reserva por turno de llegada: 08:00, 14:00 y 19:00 de lunes a
//   viernes; 08:00 y 14:00 los sábados; domingos cerrado (ver config.turnos).
// - Cada turno tiene su propio cupo de `capacidad` lugares, que ocupan sólo las reservas activas de
//   ese turno (llegue o no la persona: no hay liberación por vencimiento).
// - Un turno se puede reservar hasta su hora de inicio (o hasta `anticipacionMin` minutos antes,
//   por defecto 0) y hasta 24 h desde ahora. Desaparece al empezar o al quedarse sin lugares, y
//   vuelve a aparecer si alguien cancela.
const config = require('../config');
const { todas } = require('../db/db');
const { MIN, aEpoch, partesLocales, sumarDias, etiquetaFecha } = require('./tiempo');

function turnosDelDia(fecha, cfg = config) {
  const dia = partesLocales(aEpoch(fecha, '12:00')).diaSemana;
  if (dia === 0) return [];
  return dia === 6 ? cfg.turnos.sabado : cfg.turnos.semana;
}

function turnosEnVentana(ahoraMs, cfg = config) {
  const desde = ahoraMs + cfg.anticipacionMin * MIN;
  const hasta = ahoraMs + cfg.ventanaHoras * 60 * MIN;
  const hoy = partesLocales(ahoraMs).fecha;
  const turnos = [];
  for (const fecha of [hoy, sumarDias(hoy, 1)]) {
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
  for (let i = 0; i < 8; i++, fecha = sumarDias(fecha, 1)) {
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
    libres: Math.max(0, cfg.capacidad - (reservas.get(`${t.fecha} ${t.hora}`) || 0)),
  }));
}

// Sólo lo que se puede elegir (H4): días con al menos un turno libre y turnos con lugares libres.
async function opcionesReserva(db, ahoraMs, cfg = config) {
  const porFecha = new Map();
  for (const t of await disponibilidad(db, ahoraMs, cfg)) {
    if (t.libres === 0) continue;
    if (!porFecha.has(t.fecha)) {
      porFecha.set(t.fecha, { fecha: t.fecha, etiqueta: etiquetaFecha(t.fecha, ahoraMs), horas: [] });
    }
    porFecha.get(t.fecha).horas.push({ hora: t.hora, libres: t.libres });
  }
  return [...porFecha.values()];
}

module.exports = { turnosDelDia, turnosEnVentana, proximoTurnoFueraDeVentana, disponibilidad, opcionesReserva };
