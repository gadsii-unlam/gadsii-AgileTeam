// Componente propio del MVP: qué franjas se pueden reservar y cuántos lugares quedan en cada una.
//
// Reglas (acordadas con el equipo):
// - Un único estacionamiento con `capacidad` lugares por franja de llegada.
// - Franjas cada `franjaMin` minutos, entre la apertura y la última llegada; domingos cerrado.
// - Se puede reservar desde `anticipacionMin` minutos en adelante y hasta 24 h desde ahora.
// - Cada reserva activa (llegue o no) ocupa un lugar en su franja: no hay liberación por vencimiento.
// - Opcionalmente se suma una ocupación simulada de "otros usuarios" para que el estacionamiento
//   se vea como uno real y no vacío.
const config = require('../config');
const { MIN, aEpoch, partesLocales, minutosAHora, sumarDias, etiquetaFecha } = require('./tiempo');

function franjasEnVentana(ahoraMs, cfg = config) {
  const desde = ahoraMs + cfg.anticipacionMin * MIN;
  const hasta = ahoraMs + cfg.ventanaHoras * 60 * MIN;
  const hoy = partesLocales(ahoraMs).fecha;
  const franjas = [];
  for (const fecha of [hoy, sumarDias(hoy, 1)]) {
    if (cfg.diasCerrado.includes(partesLocales(aEpoch(fecha, '12:00')).diaSemana)) continue;
    for (let m = cfg.aperturaMin; m <= cfg.ultimaLlegadaMin; m += cfg.franjaMin) {
      const hora = minutosAHora(m);
      const inicioMs = aEpoch(fecha, hora);
      if (inicioMs >= desde && inicioMs <= hasta) franjas.push({ fecha, hora, inicioMs });
    }
  }
  return franjas;
}

// Ocupación simulada determinística: siempre da lo mismo para la misma franja,
// con pico en el ingreso del turno noche.
function ocupacionSimulada(fecha, hora, cfg = config) {
  if (!cfg.ocupacionSimulada) return 0;
  const [h, m] = hora.split(':').map(Number);
  const minutos = h * 60 + m;
  let base;
  if (minutos < 12 * 60) base = 0.35;
  else if (minutos < 17 * 60) base = 0.25;
  else if (minutos < 18 * 60 + 30) base = 0.55;
  else if (minutos < 20 * 60) base = 0.75;
  else base = 0.4;

  let hash = 0;
  for (const c of `${fecha} ${hora}`) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  const variacion = ((hash % 1000) / 1000) * 0.35 - 0.1; // entre -0.10 y +0.25

  const pct = Math.min(1, Math.max(0, base + variacion));
  return Math.round(cfg.capacidad * pct);
}

function ocupacionReal(db, fechas) {
  const filas = db
    .prepare(
      `SELECT fecha, hora, COUNT(*) AS cantidad FROM reservas
       WHERE estado = 'activa' AND fecha IN (${fechas.map(() => '?').join(',')})
       GROUP BY fecha, hora`
    )
    .all(...fechas);
  return new Map(filas.map((f) => [`${f.fecha} ${f.hora}`, f.cantidad]));
}

// Todas las franjas de la ventana, incluidas las llenas.
function disponibilidad(db, ahoraMs, cfg = config) {
  const franjas = franjasEnVentana(ahoraMs, cfg);
  if (franjas.length === 0) return [];
  const reales = ocupacionReal(db, [...new Set(franjas.map((f) => f.fecha))]);
  return franjas.map((f) => {
    const ocupados = ocupacionSimulada(f.fecha, f.hora, cfg) + (reales.get(`${f.fecha} ${f.hora}`) || 0);
    return { ...f, libres: Math.max(0, cfg.capacidad - ocupados) };
  });
}

// Sólo lo que se puede elegir (H4): fechas con al menos una hora libre y horas con lugares libres.
function opcionesReserva(db, ahoraMs, cfg = config) {
  const porFecha = new Map();
  for (const f of disponibilidad(db, ahoraMs, cfg)) {
    if (f.libres === 0) continue;
    if (!porFecha.has(f.fecha)) {
      porFecha.set(f.fecha, { fecha: f.fecha, etiqueta: etiquetaFecha(f.fecha, ahoraMs), horas: [] });
    }
    porFecha.get(f.fecha).horas.push({ hora: f.hora, libres: f.libres });
  }
  return [...porFecha.values()];
}

module.exports = { franjasEnVentana, ocupacionSimulada, disponibilidad, opcionesReserva };
