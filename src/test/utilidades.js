// Utilidades compartidas por los tests (no es un archivo de test).
const bcrypt = require('bcryptjs');
const config = require('../config');
const { abrir } = require('../db/db');

function baseDePrueba() {
  return abrir(':memory:');
}

function crearUsuario(db, correo = 'prueba@alumno.unlam.edu.ar', password = 'clave1234', etiqueta = 'T1') {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO usuarios (correo, password_hash, etiqueta, creado_en) VALUES (?, ?, ?, ?)')
    .run(correo, bcrypt.hashSync(password, 4), etiqueta, new Date().toISOString());
  return Number(lastInsertRowid);
}

// Configuración sin ocupación simulada, para que las cuentas sean exactas.
const cfgSinSimulacion = (cambios = {}) => ({ ...config, ocupacionSimulada: false, ...cambios });

module.exports = { baseDePrueba, crearUsuario, cfgSinSimulacion };
