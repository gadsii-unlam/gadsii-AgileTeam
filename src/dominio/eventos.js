function registrarEvento(db, usuarioId, tipo, detalle = null, ahoraMs = Date.now()) {
  db.prepare('INSERT INTO eventos (usuario_id, tipo, detalle, ocurrido_en) VALUES (?, ?, ?, ?)').run(
    usuarioId,
    tipo,
    detalle,
    new Date(ahoraMs).toISOString()
  );
}

module.exports = { registrarEvento };
