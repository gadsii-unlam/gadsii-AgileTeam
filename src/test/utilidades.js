// Utilidades compartidas por los tests (no es un archivo de test).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { abrir, ejecutar } = require('../db/db');

const carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'unlam-parking-test-'));
let contador = 0;

// Cada test usa su propio archivo SQLite temporal (vacío).
function urlDePrueba() {
  return `file:${path.join(carpeta, `base-${process.pid}-${++contador}.sqlite`).replace(/\\/g, '/')}`;
}

async function baseDePrueba(url = urlDePrueba()) {
  return abrir({ url });
}

async function crearUsuario(db, correo = 'prueba@alumno.unlam.edu.ar', password = 'clave1234', etiqueta = 'T1') {
  const { id } = await ejecutar(db, 'INSERT INTO usuarios (correo, password_hash, etiqueta, creado_en) VALUES (?, ?, ?, ?)', [
    correo,
    bcrypt.hashSync(password, 4),
    etiqueta,
    new Date().toISOString(),
  ]);
  return id;
}

// Configuración sin ocupación simulada, para que las cuentas sean exactas.
const cfgSinSimulacion = (cambios = {}) => ({ ...config, ocupacionSimulada: false, ...cambios });

process.on('exit', () => fs.rmSync(carpeta, { recursive: true, force: true }));

module.exports = { urlDePrueba, baseDePrueba, crearUsuario, cfgSinSimulacion };
