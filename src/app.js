const path = require('node:path');
const express = require('express');
const config = require('./config');
const { MIN, aEpoch, partesLocales, etiquetaFecha } = require('./dominio/tiempo');
const { opcionesReserva } = require('./dominio/disponibilidad');
const reservas = require('./dominio/reservas');
const sesiones = require('./dominio/sesiones');
const { registrarEvento } = require('./dominio/eventos');

const COOKIE = 'sesion';

const AVISOS = {
  cancelada: 'Cancelaste tu reserva. El lugar quedó libre para otra persona.',
  llegada: '¡Listo! Registramos tu llegada.',
};

function leerCookie(req, nombre) {
  for (const parte of (req.headers.cookie || '').split(';')) {
    const [clave, ...valor] = parte.trim().split('=');
    if (clave === nombre) return decodeURIComponent(valor.join('='));
  }
  return null;
}

function escribirCookieSesion(req, res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
    maxAge: config.sesionDias * 24 * 60 * MIN,
  });
}

// Sólo rutas internas, para que "volver" no pueda llevar a otro sitio.
function rutaInterna(valor) {
  return typeof valor === 'string' && /^\/(?!\/)[\w\-/?=&]*$/.test(valor) ? valor : '/';
}

// Lo que necesitan las vistas para mostrar una reserva.
function describirReserva(r, ahoraMs) {
  const estado = reservas.estadoReserva(r, ahoraMs);
  const limite = partesLocales(aEpoch(r.fecha, r.hora) + config.toleranciaMin * MIN).hora;
  const llegueDesde = partesLocales(aEpoch(r.fecha, r.hora) - config.llegueDesdeMin * MIN).hora;
  return {
    id: r.id,
    fechaTexto: etiquetaFecha(r.fecha, ahoraMs),
    hora: r.hora,
    limite,
    llegueDesde,
    estado,
    horaLlegada: r.llegada_registrada_en ? partesLocales(Date.parse(r.llegada_registrada_en)).hora : null,
    puedeCancelar: reservas.puedeCancelar(r, ahoraMs),
    puedeLlegue: reservas.puedeRegistrarLlegada(r, ahoraMs),
    esHoy: partesLocales(ahoraMs).fecha === r.fecha,
  };
}

// confiarProxy: en local, cloudflared o el navegador llegan desde la misma PC ('loopback');
// en Netlify el pedido pasa por su proxy (true), que avisa si fue por HTTPS.
function crearApp({ db, reloj = () => Date.now(), confiarProxy = 'loopback' }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', confiarProxy);
  // require explícito: si Express lo carga solo, el empaquetador de Netlify no incluye ejs.
  app.engine('ejs', require('ejs').renderFile);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'vistas'));
  app.locals.toleranciaMin = config.toleranciaMin;

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    });
    next();
  });
  // En Netlify los archivos estáticos los sirve su CDN; esto cubre el uso local.
  app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  app.use(async (req, res, next) => {
    const token = leerCookie(req, COOKIE);
    req.token = token;
    req.usuario = await sesiones.usuarioDeSesion(db, token, reloj());
    res.locals.usuario = req.usuario;
    res.locals.rutaActual = req.originalUrl;
    // Las pantallas muestran datos que cambian: que el navegador no las guarde.
    res.set('Cache-Control', 'no-store');
    next();
  });

  const conSesion = (req, res, next) => (req.usuario ? next() : res.redirect('/login'));

  app.get('/salud', async (req, res) => {
    await db.execute('SELECT 1');
    res.json({ ok: true });
  });

  // --- Login -------------------------------------------------------------
  app.get('/login', (req, res) => {
    if (req.usuario) return res.redirect('/');
    res.render('login', { error: null, correo: '' });
  });

  app.post('/login', async (req, res) => {
    const correo = sesiones.normalizarCorreo(req.body.correo);
    const password = req.body.password || '';
    const ahora = reloj();
    const fallar = (error) => res.status(401).render('login', { error, correo });

    if (!correo || !password) return fallar('Completá tu correo UNLaM y tu contraseña.');
    // No se guarda lo tipeado (podría ser un correo real); sólo a qué cuenta corresponde, si existe.
    const cuenta = await sesiones.buscarCuenta(db, correo);
    if (await sesiones.loginBloqueado(db, cuenta?.id, ahora)) {
      return fallar(`Hubo muchos intentos fallidos. Esperá ${config.bloqueoLoginMin} minutos y volvé a intentar.`);
    }
    const usuario = await sesiones.verificarCredenciales(db, correo, password);
    if (!usuario) {
      await registrarEvento(db, cuenta?.id ?? null, 'login_fallido', null, ahora);
      return fallar('El correo o la contraseña no son correctos. Revisalos y volvé a intentar.');
    }
    escribirCookieSesion(req, res, await sesiones.crearSesion(db, usuario.id, ahora));
    await registrarEvento(db, usuario.id, 'login', null, ahora);
    res.redirect('/');
  });

  app.post('/salir', async (req, res) => {
    if (req.usuario) await registrarEvento(db, req.usuario.id, 'logout', null, reloj());
    await sesiones.cerrarSesion(db, req.token);
    res.clearCookie(COOKIE, { path: '/' });
    res.redirect('/login');
  });

  // --- Inicio ------------------------------------------------------------
  app.get('/', conSesion, async (req, res) => {
    const ahora = reloj();
    const actual = await reservas.reservaActual(db, req.usuario.id, ahora);
    res.render('inicio', {
      reserva: actual ? describirReserva(actual, ahora) : null,
      aviso: AVISOS[req.query.aviso] || null,
    });
  });

  // --- Reservar ----------------------------------------------------------
  async function mostrarReservar(req, res, { error = null, status = 200 } = {}) {
    const opciones = await opcionesReserva(db, reloj());
    res.status(status).render('reservar', {
      opciones,
      error,
      fechaElegida: req.body?.fecha || opciones[0]?.fecha,
      horaElegida: req.body?.hora || null,
    });
  }

  app.get('/reservar', conSesion, async (req, res) => {
    if (await reservas.reservaPendiente(db, req.usuario.id, reloj())) return res.redirect('/reserva');
    await mostrarReservar(req, res);
  });

  app.post('/reservas', conSesion, async (req, res) => {
    try {
      await reservas.crearReserva(db, req.usuario.id, String(req.body.fecha || ''), String(req.body.hora || ''), reloj());
      res.redirect('/reserva?nueva=1');
    } catch (error) {
      if (!(error instanceof reservas.ErrorReserva)) throw error;
      await mostrarReservar(req, res, { error: error.message, status: 409 });
    }
  });

  // --- Mi reserva --------------------------------------------------------
  app.get('/reserva', conSesion, async (req, res) => {
    const ahora = reloj();
    const actual = await reservas.reservaActual(db, req.usuario.id, ahora);
    if (!actual) return res.redirect('/');
    res.render('reserva', { reserva: describirReserva(actual, ahora), nueva: req.query.nueva === '1', error: null });
  });

  app.post('/reserva/llegue', conSesion, async (req, res) => {
    try {
      await reservas.registrarLlegada(db, req.usuario.id, Number(req.body.reserva), reloj());
    } catch (error) {
      if (!(error instanceof reservas.ErrorReserva)) throw error;
    }
    res.redirect('/reserva');
  });

  app.get('/reserva/cancelar', conSesion, async (req, res) => {
    const ahora = reloj();
    const pendiente = await reservas.reservaPendiente(db, req.usuario.id, ahora);
    if (!pendiente) return res.redirect('/');
    res.render('cancelar', { reserva: describirReserva(pendiente, ahora) });
  });

  app.post('/reserva/cancelar', conSesion, async (req, res) => {
    try {
      await reservas.cancelarReserva(db, req.usuario.id, Number(req.body.reserva), reloj());
      res.redirect('/?aviso=cancelada');
    } catch (error) {
      if (!(error instanceof reservas.ErrorReserva)) throw error;
      res.redirect('/');
    }
  });

  // --- Ayuda (H10) -------------------------------------------------------
  app.get('/ayuda', (req, res) => {
    res.render('ayuda', { volver: rutaInterna(req.query.desde) });
  });

  app.use((req, res) => res.status(404).render('error', { titulo: 'No encontramos esta página', mensaje: null }));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(error);
    // Si falló la base antes de leer la sesión, la cabecera igual necesita estos datos.
    res.locals.usuario ??= null;
    res.locals.rutaActual ??= '/';
    res.status(500).render('error', {
      titulo: 'Algo salió mal',
      mensaje: 'Tuvimos un problema de nuestro lado. Volvé a intentar en unos segundos.',
    });
  });

  return app;
}

module.exports = { crearApp };
