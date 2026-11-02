// Exporta el log de eventos a CSV, con la hora en Argentina, para analizar las métricas del TP5.
// Usa la base configurada (local o Turso, según .env).
// Uso: npm run -s eventos > eventos.csv
const { abrir, todas } = require('../db/db');
const { partesLocales } = require('../dominio/tiempo');

const csv = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;

async function main() {
  const db = await abrir();
  const filas = await todas(
    db,
    `SELECT e.ocurrido_en, u.etiqueta, e.tipo, e.detalle
     FROM eventos e LEFT JOIN usuarios u ON u.id = e.usuario_id
     ORDER BY e.id`
  );
  db.close();

  console.log('fecha,hora,usuario,evento,detalle');
  for (const f of filas) {
    const { fecha, hora } = partesLocales(Date.parse(f.ocurrido_en));
    const segundos = new Date(f.ocurrido_en).getUTCSeconds().toString().padStart(2, '0');
    console.log([fecha, `${hora}:${segundos}`, f.etiqueta, f.tipo, f.detalle].map(csv).join(','));
  }
}

main();
