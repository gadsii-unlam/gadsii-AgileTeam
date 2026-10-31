// Login simulado contra cuentas precargadas + sesión recordada por cookie.
// Todo el estado vive en la base (no en memoria) porque en Netlify cada pedido puede
// atenderlo una instancia distinta.
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { una, ejecutar } = require('../db/db');
const { MIN } = require('./tiempo');

const DIA_MS = 24 * 60 * MIN;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const iso = (ms) => new Date(ms).toISOString();

const normalizarCorreo = (correo) => String(correo || '').trim().toLowerCase();

async function buscarCuenta(db, correo) {
  return una(db, 'SELECT * FROM usuarios WHERE correo = ?', [normalizarCorreo(correo)]);
}

// Devuelve el usuario si las credenciales son correctas, o null.
async function verificarCredenciales(db, correo, password) {
  const usuario = await buscarCuenta(db, correo);
  if (!usuario || !(await bcrypt.compare(String(password || ''), usuario.password_hash))) return null;
  return usuario;
}

async function crearSesion(db, usuarioId, ahoraMs = Date.now()) {
  const token = crypto.randomBytes(32).toString('base64url');
  await ejecutar(db, 'INSERT INTO sesiones (token_hash, usuario_id, expira_en) VALUES (?, ?, ?)', [
    hashToken(token),
    usuarioId,
    iso(ahoraMs + config.sesionDias * DIA_MS),
  ]);
  return token;
}

// La sesión dura `sesionDias` desde el último uso.
async function usuarioDeSesion(db, token, ahoraMs = Date.now()) {
  if (!token) return null;
  const fila = await una(
    db,
    `SELECT s.token_hash, s.expira_en, u.id, u.correo, u.etiqueta
     FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.token_hash = ?`,
    [hashToken(token)]
  );
  if (!fila) return null;
  const expiraMs = Date.parse(fila.expira_en);
  if (expiraMs < ahoraMs) {
    await ejecutar(db, 'DELETE FROM sesiones WHERE token_hash = ?', [fila.token_hash]);
    return null;
  }
  // Se renueva como mucho una vez cada 10 minutos, para no escribir en cada pedido.
  const nuevaExpiracion = ahoraMs + config.sesionDias * DIA_MS;
  if (nuevaExpiracion - expiraMs > 10 * MIN) {
    await ejecutar(db, 'UPDATE sesiones SET expira_en = ? WHERE token_hash = ?', [iso(nuevaExpiracion), fila.token_hash]);
  }
  return { id: Number(fila.id), correo: fila.correo, etiqueta: fila.etiqueta };
}

async function cerrarSesion(db, token) {
  if (token) await ejecutar(db, 'DELETE FROM sesiones WHERE token_hash = ?', [hashToken(token)]);
}

// Una cuenta se bloquea un rato si acumula muchos intentos fallidos desde su último login correcto.
async function loginBloqueado(db, cuentaId, ahoraMs = Date.now()) {
  if (!cuentaId) return false;
  const { fallos } = await una(
    db,
    `SELECT COUNT(*) AS fallos FROM eventos
     WHERE usuario_id = ?1 AND tipo = 'login_fallido'
       AND ocurrido_en > MAX(?2, COALESCE((SELECT MAX(ocurrido_en) FROM eventos WHERE usuario_id = ?1 AND tipo = 'login'), ''))`,
    [cuentaId, iso(ahoraMs - config.bloqueoLoginMin * MIN)]
  );
  return Number(fallos) >= config.intentosLoginMax;
}

module.exports = {
  normalizarCorreo,
  buscarCuenta,
  verificarCredenciales,
  crearSesion,
  usuarioDeSesion,
  cerrarSesion,
  loginBloqueado,
};
