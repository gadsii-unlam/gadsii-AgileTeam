// Manejo de fechas en hora de Argentina sin depender de la zona horaria de la PC.
const config = require('../config');

const MIN = 60 * 1000;
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const [, signo, hh, mm] = config.offsetUtc.match(/([+-])(\d{2}):(\d{2})/);
const offsetMs = (signo === '-' ? -1 : 1) * (Number(hh) * 60 + Number(mm)) * MIN;

const dosDigitos = (n) => String(n).padStart(2, '0');

// "2026-10-31", "19:00" -> milisegundos epoch
function aEpoch(fecha, hora) {
  return Date.parse(`${fecha}T${hora}:00${config.offsetUtc}`);
}

// milisegundos epoch -> { fecha, hora, minutos, diaSemana } en hora de Argentina
function partesLocales(ms) {
  const d = new Date(ms + offsetMs);
  return {
    fecha: `${d.getUTCFullYear()}-${dosDigitos(d.getUTCMonth() + 1)}-${dosDigitos(d.getUTCDate())}`,
    hora: `${dosDigitos(d.getUTCHours())}:${dosDigitos(d.getUTCMinutes())}`,
    minutos: d.getUTCHours() * 60 + d.getUTCMinutes(),
    diaSemana: d.getUTCDay(),
  };
}

function sumarDias(fecha, dias) {
  return partesLocales(aEpoch(fecha, '12:00') + dias * 24 * 60 * MIN).fecha;
}

// "sábado 31/10"
function fechaLarga(fecha) {
  const p = partesLocales(aEpoch(fecha, '12:00'));
  const [, mes, dia] = fecha.split('-').map(Number);
  return `${DIAS[p.diaSemana]} ${dia}/${mes}`;
}

// "Hoy, sábado 31/10" / "Mañana, domingo 1/11" / "lunes 2/11"
function etiquetaFecha(fecha, ahoraMs) {
  const hoy = partesLocales(ahoraMs).fecha;
  if (fecha === hoy) return `Hoy, ${fechaLarga(fecha)}`;
  if (fecha === sumarDias(hoy, 1)) return `Mañana, ${fechaLarga(fecha)}`;
  return fechaLarga(fecha);
}

module.exports = { MIN, aEpoch, partesLocales, sumarDias, fechaLarga, etiquetaFecha };
