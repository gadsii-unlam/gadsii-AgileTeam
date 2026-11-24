// Parámetros técnicos del MVP (variables de entorno).
// Los parámetros de reserva (horarios, cupos, tolerancia, «Llegué», anticipación) NO van acá:
// están en parametros.json, que se relee solo cuando cambia (ver recargarParametros).
const fs = require('node:fs');
const parametros = require('./parametros');

function entero(nombre, porDefecto) {
  const valor = process.env[nombre];
  if (valor === undefined || valor === '') return porDefecto;
  const n = Number.parseInt(valor, 10);
  if (Number.isNaN(n)) throw new Error(`La variable ${nombre} debe ser un número entero`);
  return n;
}

const config = {
  puerto: entero('PORT', 3000),
  host: process.env.HOST || '127.0.0.1',
  db: {
    // En Netlify: la base Turso. En local, si no hay variables: un archivo SQLite en data/
    // (ruta relativa a src/, que es desde donde corren los comandos npm; así funciona igual en Windows).
    url: process.env.TURSO_DATABASE_URL || 'file:data/parking.sqlite',
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },

  // Argentina no tiene horario de verano desde 2009: el offset es fijo.
  offsetUtc: '-03:00',

  // capacidad, toleranciaMin, llegueDesdeMin, anticipacionMin, ventanaHoras, turnos y cupos:
  // salen de parametros.json (se cargan abajo).

  sesionDias: entero('SESION_DIAS', 5),
  intentosLoginMax: 8,
  bloqueoLoginMin: 10,
};

// Fecha de modificación de parametros.json la última vez que se leyó.
let leidoMs = null;

// Vuelve a leer parametros.json si cambió desde la última vez. Se llama en cada pedido: así se
// pueden mostrar distintos escenarios en vivo con sólo guardar el archivo.
// Si el archivo quedó con un error (por ejemplo, a medio editar), se sigue con los parámetros
// anteriores y se avisa por consola; al arrancar, en cambio, un error corta la ejecución.
function recargarParametros() {
  if (leidoMs === Infinity) return; // parámetros fijados a mano (tests)
  let modificadoMs;
  try {
    modificadoMs = fs.statSync(parametros.ARCHIVO).mtimeMs;
  } catch {
    modificadoMs = null;
  }
  if (leidoMs !== null && modificadoMs === leidoMs) return;
  try {
    Object.assign(config, parametros.leer());
    if (leidoMs !== null) console.log(`Parámetros actualizados desde parametros.json (${new Date().toLocaleTimeString('es-AR')})`);
    leidoMs = modificadoMs;
  } catch (error) {
    if (leidoMs === null) throw error;
    console.error(`${error.message}. Se siguen usando los parámetros anteriores.`);
    leidoMs = modificadoMs; // no repetir el aviso hasta el próximo cambio
  }
}

// Fija los parámetros de reserva sin leer el archivo (los tests no dependen de parametros.json).
function fijarParametros(json) {
  Object.assign(config, parametros.validar(json));
  leidoMs = Infinity;
}

recargarParametros();

Object.defineProperties(config, {
  recargarParametros: { value: recargarParametros },
  fijarParametros: { value: fijarParametros },
});

module.exports = config;
