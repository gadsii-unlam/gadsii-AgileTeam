const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../config');
const { ejecutar } = require('../db/db');
const { aEpoch, etiquetaFecha } = require('../dominio/tiempo');
const { franjasEnVentana, ocupacionSimulada, disponibilidad, opcionesReserva } = require('../dominio/disponibilidad');
const { baseDePrueba, crearUsuario, cfgSinSimulacion } = require('./utilidades');

// Lunes 2/11/2026 a las 17:00 (hora de Argentina)
const LUNES_17 = aEpoch('2026-11-02', '17:00');

test('la ventana arranca en la próxima franja con 15 min de anticipación y termina a las 24 h', () => {
  const franjas = franjasEnVentana(LUNES_17);
  assert.deepEqual(franjas[0], { fecha: '2026-11-02', hora: '17:30', inicioMs: aEpoch('2026-11-02', '17:30') });
  assert.equal(franjas.at(-1).fecha, '2026-11-03');
  assert.equal(franjas.at(-1).hora, '17:00');
  // hoy 17:30..22:30 (11) + mañana 07:00..17:00 (21)
  assert.equal(franjas.length, 32);
});

test('una franja que empieza en menos de 15 minutos no se ofrece', () => {
  const franjas = franjasEnVentana(aEpoch('2026-11-02', '17:20'));
  assert.equal(franjas[0].hora, '18:00');
});

test('los domingos el estacionamiento está cerrado', () => {
  // Sábado 31/10 a las 23:00: el domingo no se ofrece y el lunes queda fuera de las 24 h
  assert.equal(franjasEnVentana(aEpoch('2026-10-31', '23:00')).length, 0);
  const sabadoTarde = franjasEnVentana(aEpoch('2026-10-31', '20:00'));
  assert.deepEqual([...new Set(sabadoTarde.map((f) => f.fecha))], ['2026-10-31']);
});

test('la ocupación simulada es estable y nunca supera la capacidad', () => {
  for (const f of franjasEnVentana(LUNES_17)) {
    const ocupados = ocupacionSimulada(f.fecha, f.hora);
    assert.equal(ocupados, ocupacionSimulada(f.fecha, f.hora));
    assert.ok(ocupados >= 0 && ocupados <= config.capacidad);
  }
  assert.equal(ocupacionSimulada('2026-11-02', '19:00', cfgSinSimulacion()), 0);
});

test('cada reserva activa resta un lugar en su franja; las canceladas no', async () => {
  const db = await baseDePrueba();
  const usuario = await crearUsuario(db);
  const cfg = cfgSinSimulacion({ capacidad: 3 });
  const insertar = "INSERT INTO reservas (usuario_id, fecha, hora, estado, creada_en) VALUES (?, '2026-11-02', '19:00', ?, '')";
  await ejecutar(db, insertar, [usuario, 'activa']);
  await ejecutar(db, insertar, [usuario, 'cancelada']);
  const franja = (await disponibilidad(db, LUNES_17, cfg)).find((f) => f.hora === '19:00' && f.fecha === '2026-11-02');
  assert.equal(franja.libres, 2);
});

test('las franjas llenas no aparecen en las opciones (H4)', async () => {
  const db = await baseDePrueba();
  const usuario = await crearUsuario(db);
  const cfg = cfgSinSimulacion({ capacidad: 1 });
  await ejecutar(db, "INSERT INTO reservas (usuario_id, fecha, hora, creada_en) VALUES (?, '2026-11-02', '19:00', '')", [usuario]);
  const hoy = (await opcionesReserva(db, LUNES_17, cfg)).find((o) => o.fecha === '2026-11-02');
  assert.equal(hoy.etiqueta, 'Hoy, lunes 2/11');
  assert.ok(!hoy.horas.some((h) => h.hora === '19:00'));
  assert.ok(hoy.horas.some((h) => h.hora === '19:30'));
});

test('etiquetas de fecha', () => {
  assert.equal(etiquetaFecha('2026-11-03', LUNES_17), 'Mañana, martes 3/11');
  assert.equal(etiquetaFecha('2026-11-05', LUNES_17), 'jueves 5/11');
});
