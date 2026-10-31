const test = require('node:test');
const assert = require('node:assert/strict');
const { aEpoch, MIN } = require('../dominio/tiempo');
const r = require('../dominio/reservas');
const { baseDePrueba, crearUsuario, cfgSinSimulacion } = require('./utilidades');

const LUNES_17 = aEpoch('2026-11-02', '17:00');
const HORA_19 = aEpoch('2026-11-02', '19:00');
const cfg = cfgSinSimulacion({ capacidad: 2 });

function preparar() {
  const db = baseDePrueba();
  const usuario = crearUsuario(db);
  const id = r.crearReserva(db, usuario, '2026-11-02', '19:00', LUNES_17, cfg);
  const leer = () => db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);
  return { db, usuario, id, leer };
}

test('se puede tener una sola reserva activa', () => {
  const { db, usuario } = preparar();
  assert.throws(() => r.crearReserva(db, usuario, '2026-11-02', '20:00', LUNES_17, cfg), r.ErrorReserva);
});

test('no se puede reservar una franja llena ni una fuera de la ventana', () => {
  const { db } = preparar();
  const otro = crearUsuario(db, 'otro@alumno.unlam.edu.ar');
  const tercero = crearUsuario(db, 'tercero@alumno.unlam.edu.ar');
  r.crearReserva(db, otro, '2026-11-02', '19:00', LUNES_17, cfg);
  assert.throws(() => r.crearReserva(db, tercero, '2026-11-02', '19:00', LUNES_17, cfg), /ya no tiene lugares/);
  assert.throws(() => r.crearReserva(db, tercero, '2026-11-02', '16:00', LUNES_17, cfg), r.ErrorReserva);
  assert.throws(() => r.crearReserva(db, tercero, '2026-11-04', '19:00', LUNES_17, cfg), r.ErrorReserva);
});

test('cancelar libera la reserva y permite reservar de nuevo', () => {
  const { db, usuario, id, leer } = preparar();
  r.cancelarReserva(db, usuario, id, LUNES_17, cfg);
  assert.equal(r.estadoReserva(leer(), LUNES_17, cfg), 'cancelada');
  assert.equal(r.reservaActual(db, usuario, LUNES_17, cfg), null);
  r.crearReserva(db, usuario, '2026-11-02', '19:00', LUNES_17, cfg);
});

test('no se puede cancelar la reserva de otra persona', () => {
  const { db, id } = preparar();
  const otro = crearUsuario(db, 'otro@alumno.unlam.edu.ar');
  assert.throws(() => r.cancelarReserva(db, otro, id, LUNES_17, cfg), /No encontramos/);
});

test('"Llegué" se habilita 60 minutos antes de la hora reservada', () => {
  const { db, usuario, id, leer } = preparar();
  assert.equal(r.puedeRegistrarLlegada(leer(), HORA_19 - 61 * MIN, cfg), false);
  assert.throws(() => r.registrarLlegada(db, usuario, id, HORA_19 - 61 * MIN, cfg), r.ErrorReserva);
  r.registrarLlegada(db, usuario, id, HORA_19 + 5 * MIN, cfg);
  assert.equal(r.estadoReserva(leer(), HORA_19 + 5 * MIN, cfg), 'llegada');
  assert.equal(r.puedeCancelar(leer(), HORA_19 + 5 * MIN, cfg), false);
  // ya no está pendiente: puede reservar otra
  assert.equal(r.reservaPendiente(db, usuario, HORA_19 + 5 * MIN, cfg), null);
});

test('si no aprieta "Llegué" antes de la tolerancia queda como "no llegó" (sólo informativo)', () => {
  const { db, usuario, id, leer } = preparar();
  const despues = HORA_19 + 16 * MIN;
  assert.equal(r.estadoReserva(leer(), despues, cfg), 'no_llego');
  assert.equal(r.puedeCancelar(leer(), despues, cfg), false);
  // sigue mostrándose ese día y se puede registrar la llegada tarde
  assert.equal(r.reservaActual(db, usuario, despues, cfg).id, id);
  r.registrarLlegada(db, usuario, id, despues, cfg);
  assert.equal(r.estadoReserva(leer(), despues, cfg), 'llegada_tarde');
  // el lugar no se libera (no hay liberación por vencimiento)
  const ocupadas = db.prepare("SELECT COUNT(*) AS n FROM reservas WHERE estado = 'activa'").get().n;
  assert.equal(ocupadas, 1);
});

test('al otro día la reserva ya no se muestra', () => {
  const { db, usuario } = preparar();
  assert.equal(r.reservaActual(db, usuario, aEpoch('2026-11-03', '08:00'), cfg), null);
});

test('se registran eventos de reserva, cancelación y llegada', () => {
  const { db, usuario, id } = preparar();
  r.registrarLlegada(db, usuario, id, HORA_19 - 2 * MIN, cfg);
  const tipos = db.prepare('SELECT tipo, detalle FROM eventos ORDER BY id').all();
  assert.deepEqual(tipos.map((e) => e.tipo), ['reserva_creada', 'llegue']);
  assert.equal(tipos[1].detalle, '2026-11-02 19:00 (-2 min)');
});
