// Recorre el flujo principal por HTTP, como lo haría el navegador:
// login -> reservar -> confirmación -> Llegué -> (otra reserva) -> cancelar.
const test = require('node:test');
const assert = require('node:assert/strict');
const { crearApp } = require('../app');
const { aEpoch, MIN } = require('../dominio/tiempo');
const { baseDePrueba, crearUsuario } = require('./utilidades');

const CORREO = 'prueba@alumno.unlam.edu.ar';
const CLAVE = 'clave1234';

async function levantar() {
  const db = baseDePrueba();
  crearUsuario(db, CORREO, CLAVE, 'T1');
  const reloj = { ahora: aEpoch('2026-11-02', '17:00') };
  const app = crearApp({ db, reloj: () => reloj.ahora });
  const servidor = await new Promise((ok) => {
    const s = app.listen(0, '127.0.0.1', () => ok(s));
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  let cookie = '';

  async function pedir(ruta, { form, metodo } = {}) {
    const respuesta = await fetch(base + ruta, {
      method: metodo || (form ? 'POST' : 'GET'),
      redirect: 'manual',
      headers: {
        cookie,
        ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: form ? new URLSearchParams(form).toString() : undefined,
    });
    const setCookie = respuesta.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return { status: respuesta.status, location: respuesta.headers.get('location'), html: await respuesta.text() };
  }

  return { db, reloj, pedir, cerrar: () => servidor.close() };
}

test('flujo completo del MVP', async (t) => {
  const { db, reloj, pedir, cerrar } = await levantar();
  t.after(cerrar);

  // Sin sesión, todo lleva al login
  assert.equal((await pedir('/')).location, '/login');
  const login = await pedir('/login');
  assert.match(login.html, /Correo UNLaM/);
  assert.doesNotMatch(login.html, /class="boton-ayuda"/, 'el login no tiene botón de Ayuda');

  // Credenciales incorrectas -> mensaje claro (H9)
  const fallido = await pedir('/login', { form: { correo: CORREO, password: 'mala' } });
  assert.equal(fallido.status, 401);
  assert.match(fallido.html, /El correo o la contraseña no son correctos/);

  // Login correcto
  const ok = await pedir('/login', { form: { correo: CORREO.toUpperCase(), password: CLAVE } });
  assert.equal(ok.location, '/');

  // Inicio sin reserva, con Ayuda (H10)
  let inicio = await pedir('/');
  assert.match(inicio.html, /No tenés una reserva activa/);
  assert.match(inicio.html, /Reservar estacionamiento/);
  assert.match(inicio.html, /class="boton-ayuda"/);

  // Reservar: sólo horarios con lugares, con la cantidad que queda (H4)
  const reservar = await pedir('/reservar');
  assert.match(reservar.html, /Hoy, lunes 2\/11/);
  assert.match(reservar.html, /quedan? \d+ lugar/);
  const hora = reservar.html.match(/<option value="(\d\d:\d\d)"/)[1];

  const creada = await pedir('/reservas', { form: { fecha: '2026-11-02', hora } });
  assert.equal(creada.location, '/reserva?nueva=1');
  const confirmacion = await pedir('/reserva?nueva=1');
  assert.match(confirmacion.html, /Reserva confirmada/);
  assert.match(confirmacion.html, /15 minutos/);
  assert.match(confirmacion.html, /Cancelar reserva/);
  assert.match(confirmacion.html, /Continuar/);

  // Inicio con reserva
  inicio = await pedir('/');
  assert.match(inicio.html, /Tenés una reserva/);
  assert.match(inicio.html, /Ver mi reserva/);

  // Una segunda reserva no se permite
  assert.equal((await pedir('/reservar')).location, '/reserva');

  // Llegué: a la hora reservada
  reloj.ahora = aEpoch('2026-11-02', hora) + 3 * MIN;
  const idReserva = confirmacion.html.match(/name="reserva" value="(\d+)"/)?.[1]
    ?? db.prepare('SELECT id FROM reservas').get().id;
  assert.equal((await pedir('/reserva/llegue', { form: { reserva: String(idReserva) } })).location, '/reserva');
  const despuesDeLlegar = await pedir('/reserva');
  assert.match(despuesDeLlegar.html, /Registraste tu llegada a las \d\d:\d\d hs, a tiempo/);
  assert.doesNotMatch(despuesDeLlegar.html, /Cancelar reserva/);

  // Ya llegó: puede reservar para otro momento y cancelarla
  reloj.ahora = aEpoch('2026-11-02', '17:00');
  const reservar2 = await pedir('/reservar');
  assert.equal(reservar2.status, 200);
  const manana = reservar2.html.match(/<option value="(2026-11-03)"/)[1];
  // Horas de mañana: las trae el JSON embebido
  const opciones = JSON.parse(reservar2.html.match(/id="datos-opciones">([^<]*)</)[1]);
  const horaManana = opciones.find((o) => o.fecha === manana).horas[0].hora;
  assert.equal((await pedir('/reservas', { form: { fecha: manana, hora: horaManana } })).location, '/reserva?nueva=1');

  const cancelar = await pedir('/reserva/cancelar');
  assert.match(cancelar.html, /¿Seguro que querés cancelar tu reserva\?/);
  const id2 = cancelar.html.match(/name="reserva" value="(\d+)"/)[1];
  assert.equal((await pedir('/reserva/cancelar', { form: { reserva: id2 } })).location, '/?aviso=cancelada');
  inicio = await pedir('/?aviso=cancelada');
  assert.match(inicio.html, /Cancelaste tu reserva/);
  assert.match(inicio.html, /No tenés una reserva activa/);

  // Ayuda vuelve a la pantalla de origen y permite cerrar sesión
  const ayuda = await pedir('/ayuda?desde=%2Freservar');
  assert.match(ayuda.html, /Cómo registrar tu llegada/);
  assert.match(ayuda.html, /href="\/reservar"/);
  assert.match((await pedir('/ayuda?desde=https%3A%2F%2Fmalo.com')).html, /class="boton primario" href="\/"/);

  assert.equal((await pedir('/salir', { form: {} })).location, '/login');
  assert.equal((await pedir('/')).location, '/login');

  const tipos = db.prepare('SELECT tipo FROM eventos ORDER BY id').all().map((e) => e.tipo);
  assert.deepEqual(tipos, ['login_fallido', 'login', 'reserva_creada', 'llegue', 'reserva_creada', 'reserva_cancelada', 'logout']);
});

test('la sesión vence a los 5 días sin uso', async (t) => {
  const { reloj, pedir, cerrar } = await levantar();
  t.after(cerrar);
  await pedir('/login', { form: { correo: CORREO, password: CLAVE } });
  reloj.ahora += 4 * 24 * 60 * MIN;
  assert.equal((await pedir('/')).status, 200, 'a los 4 días sigue logueado');
  reloj.ahora += 5 * 24 * 60 * MIN + MIN;
  assert.equal((await pedir('/')).location, '/login', 'a los 5 días sin uso pide login');
});
