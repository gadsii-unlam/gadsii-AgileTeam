// Copia de todas las tablas a un archivo JSON en data/backups/.
// Funciona con la base local o con la de Turso (si TURSO_DATABASE_URL está en .env).
// Uso: npm run backup
const fs = require('node:fs');
const path = require('node:path');
const { abrir, todas } = require('../db/db');

const TABLAS = ['usuarios', 'reservas', 'sesiones', 'eventos'];

async function main() {
  const db = await abrir();
  const copia = { creado_en: new Date().toISOString() };
  for (const tabla of TABLAS) copia[tabla] = await todas(db, `SELECT * FROM ${tabla} ORDER BY rowid`);
  db.close();

  const carpeta = path.join(__dirname, '..', 'data', 'backups');
  fs.mkdirSync(carpeta, { recursive: true });
  const destino = path.join(carpeta, `parking-${copia.creado_en.replace(/[:.]/g, '-').slice(0, 19)}.json`);
  fs.writeFileSync(destino, JSON.stringify(copia, null, 2));
  console.log(`Backup guardado en ${destino}`);
}

main();
