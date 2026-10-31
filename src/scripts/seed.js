// Carga las cuentas "universitarias" simuladas.
//
// Uso:
//   npm run seed                      -> crea las cuentas que falten
//   npm run seed -- --nuevas-claves   -> además regenera la contraseña de las que ya existen
//
// Carga en la base configurada: el archivo local o, si hay TURSO_DATABASE_URL (en .env), la de Turso.
// Si existe data/usuarios.json se usan esas cuentas; si no, las de CUENTAS_POR_DEFECTO.
// Las contraseñas que no vengan en el archivo se generan al azar. Todas las contraseñas
// nuevas se escriben en data/credenciales.txt (no se sube al repo) para entregarlas a mano.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { abrir, una, ejecutar } = require('../db/db');

// Nombres ficticios: en el repo no hay datos personales reales.
const CUENTAS_POR_DEFECTO = [
  { etiqueta: 'U1', correo: 'lgomez@alumno.unlam.edu.ar' },
  { etiqueta: 'U2', correo: 'mfernandez@alumno.unlam.edu.ar' },
  { etiqueta: 'U3', correo: 'jrodriguez@alumno.unlam.edu.ar' },
  { etiqueta: 'EQ1', correo: 'equipo1@alumno.unlam.edu.ar' },
  { etiqueta: 'EQ2', correo: 'equipo2@alumno.unlam.edu.ar' },
  { etiqueta: 'EQ3', correo: 'equipo3@alumno.unlam.edu.ar' },
  { etiqueta: 'EQ4', correo: 'equipo4@alumno.unlam.edu.ar' },
  { etiqueta: 'EQ5', correo: 'equipo5@alumno.unlam.edu.ar' },
  { etiqueta: 'DEMO', correo: 'demo@unlam.edu.ar' },
];

const PALABRAS = ['auto', 'lugar', 'ruta', 'parque', 'nafta', 'volante', 'barrera', 'patente'];

// Fácil de tipear en el celular: palabra + 4 números (ej. "ruta4821").
function claveAlAzar() {
  return PALABRAS[crypto.randomInt(PALABRAS.length)] + String(crypto.randomInt(1000, 10000));
}

function cargarCuentas() {
  const archivo = path.join(__dirname, '..', 'data', 'usuarios.json');
  if (!fs.existsSync(archivo)) return CUENTAS_POR_DEFECTO;
  return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

async function main() {
  const nuevasClaves = process.argv.includes('--nuevas-claves');
  const db = await abrir();
  const credenciales = [];

  for (const cuenta of cargarCuentas()) {
    const correo = cuenta.correo.trim().toLowerCase();
    const existente = await una(db, 'SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existente && !nuevasClaves) {
      console.log(`= ${cuenta.etiqueta.padEnd(5)} ${correo} (ya existía, sin cambios)`);
      continue;
    }
    const clave = cuenta.password || claveAlAzar();
    const hash = bcrypt.hashSync(clave, 10);
    if (existente) {
      await ejecutar(db, 'UPDATE usuarios SET password_hash = ?, etiqueta = ? WHERE id = ?', [hash, cuenta.etiqueta, existente.id]);
    } else {
      await ejecutar(db, 'INSERT INTO usuarios (correo, password_hash, etiqueta, creado_en) VALUES (?, ?, ?, ?)', [
        correo,
        hash,
        cuenta.etiqueta,
        new Date().toISOString(),
      ]);
    }
    credenciales.push(`${cuenta.etiqueta}\t${correo}\t${clave}`);
    console.log(`+ ${cuenta.etiqueta.padEnd(5)} ${correo}`);
  }

  if (credenciales.length > 0) {
    const archivo = path.join(__dirname, '..', 'data', 'credenciales.txt');
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    fs.appendFileSync(archivo, `# ${new Date().toISOString()}\n${credenciales.join('\n')}\n`);
    console.log(`\nContraseñas nuevas guardadas en ${archivo} (no se sube al repo).`);
  }
  db.close();
}

main();
