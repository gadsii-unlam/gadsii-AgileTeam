// Login simulado contra cuentas precargadas + sesión recordada por cookie.
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { MIN } = require('./tiempo');

const DIA_MS = 24 * 60 * MIN;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const normalizarCorreo = (correo) => String(correo || '').trim().toLowerCase();

// Devuelve el usuario si las credenciales son correctas, o null.
function verificarCredenciales(db, correo, password) {
  const usuario = db.prepare('SELECT * FROM usuarios WHERE correo = ?').get(normalizarCorreo(correo));
  if (!usuario || !bcrypt.compareSync(String(password || ''), usuario.password_hash)) return null;
  return usuario;
}

function crearSesion(db, usuarioId, ahoraMs = Date.now()) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sesiones (token_hash, usuario_id, expira_en) VALUES (?, ?, ?)').run(
    hashToken(token),
    usuarioId,
    new Date(ahoraMs + config.sesionDias * DIA_MS).toISOString()
  );
  return token;
}

// La sesión dura `sesionDias` desde el último uso.
function usuarioDeSesion(db, token, ahoraMs = Date.now()) {
  if (!token) return null;
  const fila = db
    .prepare(
      `SELECT s.token_hash, s.expira_en, u.id, u.correo, u.etiqueta
       FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token_hash = ?`
    )
    .get(hashToken(token));
  if (!fila) return null;
  if (Date.parse(fila.expira_en) < ahoraMs) {
    db.prepare('DELETE FROM sesiones WHERE token_hash = ?').run(fila.token_hash);
    return null;
  }
  db.prepare('UPDATE sesiones SET expira_en = ? WHERE token_hash = ?').run(
    new Date(ahoraMs + config.sesionDias * DIA_MS).toISOString(),
    fila.token_hash
  );
  return { id: fila.id, correo: fila.correo, etiqueta: fila.etiqueta };
}

function cerrarSesion(db, token) {
  if (token) db.prepare('DELETE FROM sesiones WHERE token_hash = ?').run(hashToken(token));
}

// Límite simple de intentos fallidos por correo, en memoria.
const intentos = new Map();

function loginBloqueado(correo, ahoraMs = Date.now()) {
  const registro = intentos.get(normalizarCorreo(correo));
  return Boolean(registro && registro.bloqueadoHasta > ahoraMs);
}

function anotarFallo(correo, ahoraMs = Date.now()) {
  const clave = normalizarCorreo(correo);
  const registro = intentos.get(clave) || { fallos: 0, bloqueadoHasta: 0 };
  registro.fallos += 1;
  if (registro.fallos >= config.intentosLoginMax) {
    registro.fallos = 0;
    registro.bloqueadoHasta = ahoraMs + config.bloqueoLoginMin * MIN;
  }
  intentos.set(clave, registro);
}

function limpiarFallos(correo) {
  intentos.delete(normalizarCorreo(correo));
}

module.exports = {
  normalizarCorreo,
  verificarCredenciales,
  crearSesion,
  usuarioDeSesion,
  cerrarSesion,
  loginBloqueado,
  anotarFallo,
  limpiarFallos,
};
