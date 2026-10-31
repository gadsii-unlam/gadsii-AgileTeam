// Parámetros del MVP. Se pueden cambiar con variables de entorno sin tocar código
// (no hay pantalla de administración en el MVP).

function entero(nombre, porDefecto) {
  const valor = process.env[nombre];
  if (valor === undefined || valor === '') return porDefecto;
  const n = Number.parseInt(valor, 10);
  if (Number.isNaN(n)) throw new Error(`La variable ${nombre} debe ser un número entero`);
  return n;
}

// Lista de horas "HH:MM" separadas por coma (ej. "08:00,14:00,19:00").
function horas(nombre, porDefecto) {
  const valor = process.env[nombre];
  const lista = valor ? valor.split(',').map((h) => h.trim()) : porDefecto;
  for (const h of lista) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(h)) throw new Error(`${nombre}: "${h}" no es una hora HH:MM válida`);
  }
  return lista;
}

module.exports = {
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

  // Lugares por turno (cada turno tiene su propio cupo).
  capacidad: entero('CAPACIDAD', 15),
  toleranciaMin: entero('TOLERANCIA_MIN', 15),
  // Turnos de llegada, según los horarios de cursada. Los sábados la universidad cierra a las 18
  // y los domingos está cerrada.
  turnos: {
    semana: horas('TURNOS', ['08:00', '14:00', '19:00']),
    sabado: horas('TURNOS_SABADO', ['08:00', '14:00']),
  },
  // Un turno se puede reservar hasta su hora de inicio (0 = sin anticipación mínima).
  anticipacionMin: entero('ANTICIPACION_MIN', 0),
  ventanaHoras: 24,
  llegueDesdeMin: entero('LLEGUE_DESDE_MIN', 60),

  sesionDias: entero('SESION_DIAS', 5),
  intentosLoginMax: 8,
  bloqueoLoginMin: 10,
};
