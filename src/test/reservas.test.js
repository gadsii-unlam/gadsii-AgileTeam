const test = require('node:test');
const assert = require('node:assert/strict');
const { aEpoch, MIN } = require('../dominio/tiempo');
const { una } = require('../db/db');
const r = require('../dominio/reservas');
const { urlDePrueba, baseDePrueba, crearUsuario, cfgSinSimulacion } = require('./utilidades');

const LUNES_17 = aEpoch('2026-11-02', '17:00');
const HORA_19 = aEpoch('2026-11-02', '19:00');
const cfg = cfgSinSimulacion({ capacidad: 2 });

async function preparar() {
  const db = await baseDePrueba();
  const usuario = await crearUsuario(db);
  const id = await r.crearReserva(db, usuario, '2026-11-02', '19:00', LUNES_17, cfg);
  const leer = () => una(db, 'SELECT * FROM reservas WHERE id = ?', [id]);
  return { db, usuario, id, leer };
}

const activas = async (db) => Number((await una(db, "SELECT COUNT(*) AS n FROM reservas WHERE estado = 'activa'")).n);

test('se puede tener una sola reserva activa', async () => {
  const { db, usuario } = await preparar();
  await assert.rejects(r.crearReserva(db, usuario, '2026-11-02', '20:00', LUNES_17, cfg), /Ya tenés una reserva activa/);
});

test('no se puede reservar una franja llena ni una fuera de la ventana', async () => {
  const { db } = await preparar();
  const otro = await crearUsuario(db, 'otro@alumno.unlam.edu.ar');
  const tercero = await crearUsuario(db, 'tercero@alumno.unlam.edu.ar');
  await r.crearReserva(db, otro, '2026-11-02', '19:00', LUNES_17, cfg);
  await assert.rejects(r.crearReserva(db, tercero, '2026-11-02', '19:00', LUNES_17, cfg), /ya no tiene lugares/);
  await assert.rejects(r.crearReserva(db, tercero, '2026-11-02', '16:00', LUNES_17, cfg), r.ErrorReserva);
  await assert.rejects(r.crearReserva(db, tercero, '2026-11-04', '19:00', LUNES_17, cfg), r.ErrorReserva);
});

test('cancelar libera la reserva y permite reservar de nuevo', async () => {
  const { db, usuario, id, leer } = await preparar();
  await r.cancelarReserva(db, usuario, id, LUNES_17, cfg);
  assert.equal(r.estadoReserva(await leer(), LUNES_17, cfg), 'cancelada');
  assert.equal(await r.reservaActual(db, usuario, LUNES_17, cfg), null);
  await r.crearReserva(db, usuario, '2026-11-02', '19:00', LUNES_17, cfg);
});

test('no se puede cancelar la reserva de otra persona', async () => {
  const { db, id } = await preparar();
  const otro = await crearUsuario(db, 'otro@alumno.unlam.edu.ar');
  await assert.rejects(r.cancelarReserva(db, otro, id, LUNES_17, cfg), r.ErrorReserva);
  assert.equal(await activas(db), 1);
});

test('"Llegué" se habilita 60 minutos antes de la hora reservada', async () => {
  const { db, usuario, id, leer } = await preparar();
  assert.equal(r.puedeRegistrarLlegada(await leer(), HORA_19 - 61 * MIN, cfg), false);
  await assert.rejects(r.registrarLlegada(db, usuario, id, HORA_19 - 61 * MIN, cfg), r.ErrorReserva);
  await r.registrarLlegada(db, usuario, id, HORA_19 + 5 * MIN, cfg);
  assert.equal(r.estadoReserva(await leer(), HORA_19 + 5 * MIN, cfg), 'llegada');
  assert.equal(r.puedeCancelar(await leer(), HORA_19 + 5 * MIN, cfg), false);
  await assert.rejects(r.cancelarReserva(db, usuario, id, HORA_19 + 5 * MIN, cfg), r.ErrorReserva);
  // ya no está pendiente: puede reservar otra
  assert.equal(await r.reservaPendiente(db, usuario, HORA_19 + 5 * MIN, cfg), null);
});

test('si no aprieta "Llegué" antes de la tolerancia queda como "no llegó" (sólo informativo)', async () => {
  const { db, usuario, id, leer } = await preparar();
  const despues = HORA_19 + 16 * MIN;
  assert.equal(r.estadoReserva(await leer(), despues, cfg), 'no_llego');
  assert.equal(r.puedeCancelar(await leer(), despues, cfg), false);
  await assert.rejects(r.cancelarReserva(db, usuario, id, despues, cfg), r.ErrorReserva);
  // sigue mostrándose ese día y se puede registrar la llegada tarde
  assert.equal(Number((await r.reservaActual(db, usuario, despues, cfg)).id), id);
  await r.registrarLlegada(db, usuario, id, despues, cfg);
  assert.equal(r.estadoReserva(await leer(), despues, cfg), 'llegada_tarde');
  // el lugar no se libera (no hay liberación por vencimiento)
  assert.equal(await activas(db), 1);
});

test('al otro día la reserva ya no se muestra', async () => {
  const { db, usuario } = await preparar();
  assert.equal(await r.reservaActual(db, usuario, aEpoch('2026-11-03', '08:00'), cfg), null);
});

test('se registran eventos de reserva, cancelación y llegada', async () => {
  const { db, usuario, id } = await preparar();
  await r.registrarLlegada(db, usuario, id, HORA_19 - 2 * MIN, cfg);
  const { rows } = await db.execute('SELECT tipo, detalle FROM eventos ORDER BY id');
  assert.deepEqual(rows.map((e) => e.tipo), ['reserva_creada', 'llegue']);
  assert.equal(rows[1].detalle, '2026-11-02 19:00 (-2 min)');
});

// --- Concurrencia -----------------------------------------------------------
// Cada "instancia" es una conexión independiente a la misma base, como pasa en Netlify
// cuando varias funciones atienden pedidos al mismo tiempo.

async function instancias(cantidad) {
  const url = urlDePrueba();
  const conexiones = [];
  for (let i = 0; i < cantidad; i++) conexiones.push(await baseDePrueba(url));
  return conexiones;
}

async function usuarios(db, cantidad) {
  const ids = [];
  for (let i = 0; i < cantidad; i++) ids.push(await crearUsuario(db, `u${i}@alumno.unlam.edu.ar`, 'x', `C${i}`));
  return ids;
}

test('concurrencia: 30 personas por el último lugar -> sólo una lo consigue', async () => {
  const conexiones = await instancias(6);
  const ids = await usuarios(conexiones[0], 30);
  const cfg1 = cfgSinSimulacion({ capacidad: 1 });

  const resultados = await Promise.allSettled(
    ids.map((id, i) => r.crearReserva(conexiones[i % conexiones.length], id, '2026-11-02', '19:00', LUNES_17, cfg1))
  );

  const ok = resultados.filter((x) => x.status === 'fulfilled');
  const rechazos = resultados.filter((x) => x.status === 'rejected');
  assert.equal(ok.length, 1);
  assert.ok(rechazos.every((x) => /ya no tiene lugares/.test(x.reason.message)), 'los demás reciben un mensaje claro');
  assert.equal(await activas(conexiones[0]), 1);
});

test('concurrencia: 60 personas por 15 lugares -> exactamente 15 reservas', async () => {
  const conexiones = await instancias(8);
  const ids = await usuarios(conexiones[0], 60);
  const cfg15 = cfgSinSimulacion({ capacidad: 15 });

  const resultados = await Promise.allSettled(
    ids.map((id, i) => r.crearReserva(conexiones[i % conexiones.length], id, '2026-11-02', '19:00', LUNES_17, cfg15))
  );

  assert.equal(resultados.filter((x) => x.status === 'fulfilled').length, 15);
  assert.equal(await activas(conexiones[0]), 15);
});

test('concurrencia: doble toque del mismo usuario -> una sola reserva', async () => {
  const conexiones = await instancias(4);
  const [id] = await usuarios(conexiones[0], 1);
  const horas = ['19:00', '19:30', '20:00', '20:30'];

  const resultados = await Promise.allSettled(
    horas.map((hora, i) => r.crearReserva(conexiones[i], id, '2026-11-02', hora, LUNES_17, cfg))
  );

  assert.equal(resultados.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal(await activas(conexiones[0]), 1);
});

test('concurrencia: cancelar y «Llegué» al mismo tiempo -> sólo una de las dos acciones', async () => {
  const conexiones = await instancias(2);
  const [id] = await usuarios(conexiones[0], 1);
  const reserva = await r.crearReserva(conexiones[0], id, '2026-11-02', '19:00', LUNES_17, cfg);
  const ahora = HORA_19 - 5 * MIN; // se puede cancelar y también registrar la llegada

  const resultados = await Promise.allSettled([
    r.cancelarReserva(conexiones[0], id, reserva, ahora, cfg),
    r.registrarLlegada(conexiones[1], id, reserva, ahora, cfg),
  ]);

  assert.equal(resultados.filter((x) => x.status === 'fulfilled').length, 1);
  const fila = await una(conexiones[0], 'SELECT * FROM reservas WHERE id = ?', [reserva]);
  assert.ok(fila.estado === 'cancelada' ? fila.llegada_registrada_en === null : fila.llegada_registrada_en !== null);
});
