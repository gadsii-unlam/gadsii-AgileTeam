// Copia consistente de la base en data/backups/ (se puede correr con el servidor andando).
// Uso: npm run backup
const fs = require('node:fs');
const path = require('node:path');
const { abrir } = require('../db/db');

const carpeta = path.join(__dirname, '..', 'data', 'backups');
fs.mkdirSync(carpeta, { recursive: true });
const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const destino = path.join(carpeta, `parking-${sello}.sqlite`);

const db = abrir();
db.prepare('VACUUM INTO ?').run(destino);
db.close();
console.log(`Backup guardado en ${destino}`);
