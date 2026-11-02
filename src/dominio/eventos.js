const { ejecutar } = require('../db/db');

async function registrarEvento(db, usuarioId, tipo, detalle = null, ahoraMs = Date.now()) {
  await ejecutar(db, 'INSERT INTO eventos (usuario_id, tipo, detalle, ocurrido_en) VALUES (?, ?, ?, ?)', [
    usuarioId,
    tipo,
    detalle,
    new Date(ahoraMs).toISOString(),
  ]);
}

module.exports = { registrarEvento };
