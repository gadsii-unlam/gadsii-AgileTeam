// Parámetros del MVP. Se pueden cambiar con variables de entorno sin tocar código
// (no hay pantalla de administración en el MVP).
const path = require('node:path');

function entero(nombre, porDefecto) {
  const valor = process.env[nombre];
  if (valor === undefined || valor === '') return porDefecto;
  const n = Number.parseInt(valor, 10);
  if (Number.isNaN(n)) throw new Error(`La variable ${nombre} debe ser un número entero`);
  return n;
}

function horaAMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

module.exports = {
  puerto: entero('PORT', 3000),
  // Sólo escucha en la PC local: el túnel de Cloudflare se conecta a localhost.
  host: process.env.HOST || '127.0.0.1',
  rutaBase: process.env.DB_PATH || path.join(__dirname, 'data', 'parking.sqlite'),

  // Argentina no tiene horario de verano desde 2009: el offset es fijo.
  offsetUtc: '-03:00',

  capacidad: entero('CAPACIDAD', 15),
  toleranciaMin: entero('TOLERANCIA_MIN', 15),
  franjaMin: entero('FRANJA_MIN', 30),
  aperturaMin: horaAMinutos(process.env.HORA_APERTURA || '07:00'),
  ultimaLlegadaMin: horaAMinutos(process.env.ULTIMA_LLEGADA || '22:30'),
  anticipacionMin: entero('ANTICIPACION_MIN', 15),
  ventanaHoras: 24,
  diasCerrado: [0], // 0 = domingo
  llegueDesdeMin: entero('LLEGUE_DESDE_MIN', 60),
  ocupacionSimulada: process.env.OCUPACION_SIMULADA !== '0',

  sesionDias: entero('SESION_DIAS', 5),
  intentosLoginMax: 8,
  bloqueoLoginMin: 10,
};
