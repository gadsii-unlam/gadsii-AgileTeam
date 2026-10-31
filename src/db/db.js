// Conexión a la base. En producción (Netlify) es una base Turso remota (compatible con SQLite);
// en desarrollo y en los tests es un archivo SQLite local.
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@libsql/client');
const config = require('../config');

const ESQUEMA = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// url: "libsql://..." (Turso) o "file:ruta/al/archivo.sqlite"
async function abrir({ url = config.db.url, authToken = config.db.authToken } = {}) {
  if (url.startsWith('file:')) {
    fs.mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true });
  }
  const db = createClient({ url, authToken });
  if (url.startsWith('file:')) {
    // Varias conexiones locales pueden escribir a la vez: esperar en vez de fallar.
    await db.execute('PRAGMA busy_timeout = 5000');
    await db.execute('PRAGMA journal_mode = WAL');
  }
  await db.executeMultiple(ESQUEMA);
  return db;
}

// Primera fila de una consulta, o null.
async function una(db, sql, args = []) {
  const { rows } = await db.execute({ sql, args });
  return rows[0] ?? null;
}

async function todas(db, sql, args = []) {
  return (await db.execute({ sql, args })).rows;
}

// Ejecuta una sentencia de escritura y devuelve { cambios, id }.
async function ejecutar(db, sql, args = []) {
  const r = await db.execute({ sql, args });
  return { cambios: r.rowsAffected, id: r.lastInsertRowid === undefined ? null : Number(r.lastInsertRowid) };
}

module.exports = { abrir, una, todas, ejecutar };
