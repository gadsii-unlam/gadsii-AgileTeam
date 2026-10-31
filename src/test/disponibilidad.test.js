const test = require('node:test');
const assert = require('node:assert/strict');
const { ejecutar } = require('../db/db');
const { aEpoch, etiquetaFecha } = require('../dominio/tiempo');
const { turnosDelDia, turnosEnVentana, proximoTurnoFueraDeVentana, disponibilidad, opcionesReserva } = require('../dominio/disponibilidad');
const { baseDePrueba, crearUsuario, cfgCon } = require('./utilidades');

// Lunes 2/11/2026 a las 17:00 (hora de Argentina)
const LUNES_17 = aEpoch('2026-11-02', '17:00');

const claves = (turnos) => turnos.map((t) => `${t.fecha} ${t.hora}`);

test('turnos de cursada: 8, 14 y 19 de lunes a viernes; 8 y 14 los sábados; domingo cerrado', () => {
  assert.deepEqual(turnosDelDia('2026-11-02'), ['08:00', '14:00', '19:00']); // lunes
  assert.deepEqual(turnosDelDia('2026-11-06'), ['08:00', '14:00', '19:00']); // viernes
  assert.deepEqual(turnosDelDia('2026-10-31'), ['08:00', '14:00']); // sábado
  assert.deepEqual(turnosDelDia('2026-11-01'), []); // domingo
});

test('sólo se ofrecen los turnos que todavía no empezaron, dentro de las próximas 24 h', () => {
  assert.deepEqual(claves(turnosEnVentana(LUNES_17)), ['2026-11-02 19:00', '2026-11-03 08:00', '2026-11-03 14:00']);
});

test('un turno se ofrece hasta su hora de inicio y desaparece cuando empieza', () => {
  const ofrece19 = (ms) => claves(turnosEnVentana(ms)).includes('2026-11-02 19:00');
  assert.equal(ofrece19(aEpoch('2026-11-02', '18:46')), true);
  assert.equal(ofrece19(aEpoch('2026-11-02', '18:59')), true);
  assert.equal(ofrece19(aEpoch('2026-11-02', '19:00') + 1000), false);
});

test('los sábados no hay turno de 19 y los domingos no se ofrece nada', () => {
  // Viernes 30/10 a las 20:00: sábado 8 y 14 (no hay 19 el sábado)
  assert.deepEqual(claves(turnosEnVentana(aEpoch('2026-10-30', '20:00'))), ['2026-10-31 08:00', '2026-10-31 14:00']);
  // Sábado 31/10 a las 15:00: el domingo está cerrado y el lunes queda fuera de las 24 h
  assert.deepEqual(turnosEnVentana(aEpoch('2026-10-31', '15:00')), []);
});

test('si no hay turnos en las próximas 24 h, se sabe cuál es el próximo y desde cuándo se reserva', () => {
  // Sábado 31/10 a las 19:00: el próximo es el lunes a las 8, reservable desde el domingo a las 8
  const proximo = proximoTurnoFueraDeVentana(aEpoch('2026-10-31', '19:00'));
  assert.equal(`${proximo.fecha} ${proximo.hora}`, '2026-11-02 08:00');
  assert.equal(proximo.reservableDesdeMs, aEpoch('2026-11-01', '08:00'));
});

test('cada turno tiene su propio cupo de lugares; las canceladas no ocupan lugar', async () => {
  const db = await baseDePrueba();
  const usuario = await crearUsuario(db);
  const insertar = "INSERT INTO reservas (usuario_id, fecha, hora, estado, creada_en) VALUES (?, ?, ?, ?, '')";
  await ejecutar(db, insertar, [usuario, '2026-11-03', '08:00', 'activa']);
  await ejecutar(db, insertar, [usuario, '2026-11-03', '08:00', 'activa']);
  await ejecutar(db, insertar, [usuario, '2026-11-03', '08:00', 'cancelada']);
  const libres = Object.fromEntries((await disponibilidad(db, LUNES_17)).map((t) => [`${t.fecha} ${t.hora}`, t.libres]));
  assert.deepEqual(libres, { '2026-11-02 19:00': 15, '2026-11-03 08:00': 13, '2026-11-03 14:00': 15 });
});

test('los turnos llenos no aparecen en las opciones (H4) y vuelven si alguien cancela', async () => {
  const db = await baseDePrueba();
  const usuario = await crearUsuario(db);
  const cfg = cfgCon({ capacidad: 1 });
  const ofrece19 = async () =>
    (await opcionesReserva(db, LUNES_17, cfg)).find((o) => o.fecha === '2026-11-02')?.horas.some((h) => h.hora === '19:00') ?? false;

  assert.equal(await ofrece19(), true);
  const { id } = await ejecutar(db, "INSERT INTO reservas (usuario_id, fecha, hora, creada_en) VALUES (?, '2026-11-02', '19:00', '')", [usuario]);
  assert.equal(await ofrece19(), false);
  const manana = (await opcionesReserva(db, LUNES_17, cfg)).find((o) => o.fecha === '2026-11-03');
  assert.equal(manana.etiqueta, 'Mañana, martes 3/11');
  assert.deepEqual(manana.horas, [{ hora: '08:00', libres: 1 }, { hora: '14:00', libres: 1 }]);

  await ejecutar(db, "UPDATE reservas SET estado = 'cancelada' WHERE id = ?", [id]);
  assert.equal(await ofrece19(), true);
});

test('etiquetas de fecha', () => {
  assert.equal(etiquetaFecha('2026-11-02', LUNES_17), 'Hoy, lunes 2/11');
  assert.equal(etiquetaFecha('2026-11-05', LUNES_17), 'jueves 5/11');
});
