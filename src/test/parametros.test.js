const test = require('node:test');
const assert = require('node:assert/strict');
const parametros = require('../parametros');
const { aEpoch } = require('../dominio/tiempo');
const { turnosDelDia, turnosEnVentana, disponibilidad } = require('../dominio/disponibilidad');
const reservas = require('../dominio/reservas');
const { baseDePrueba, crearUsuario, PARAMETROS_DE_PRUEBA } = require('./utilidades');

const LUNES_17 = aEpoch('2026-11-02', '17:00');
const con = (cambios) => parametros.validar({ ...PARAMETROS_DE_PRUEBA, ...cambios });
const claves = (turnos) => turnos.map((t) => `${t.fecha} ${t.hora}`);

// Si parametros.json queda mal escrito, falla este test y Netlify no publica el cambio.
test('parametros.json es válido', () => {
  assert.doesNotThrow(() => parametros.leer());
});

test('los errores de parametros.json se explican', () => {
  assert.throws(() => con({ cuposPorTurno: -1 }), /cuposPorTurno/);
  assert.throws(() => con({ toleranciaMinutos: '15' }), /toleranciaMinutos/);
  assert.throws(() => con({ toleranciaMinuto: 15 }), /clave desconocida "toleranciaMinuto"/);
  assert.throws(() => con({ horarios: { lunes: ['8:00'] } }), /"8:00" no es una hora/);
  assert.throws(() => con({ horarios: { sábado: ['08:00'] } }), /día desconocido "sábado"/);
  assert.throws(() => con({ horarios: { lunes: ['08:00', '08:00'] } }), /repetido/);
  const { cuposPorTurno, ...sinCupos } = PARAMETROS_DE_PRUEBA;
  assert.throws(() => parametros.validar(sinCupos), /falta la clave "cuposPorTurno"/);
  assert.doesNotThrow(() => con({ _nota: 'las claves con _ son comentarios' }));
});

test('horarios por día: los días que no figuran quedan cerrados', () => {
  const cfg = con({ horarios: { domingo: ['10:00', '09:30'] } });
  assert.deepEqual(turnosDelDia('2026-11-01', cfg), ['09:30', '10:00']); // domingo, ordenados
  assert.deepEqual(turnosDelDia('2026-11-02', cfg), []); // lunes
});

test('la ventana de reserva puede ser mayor a 24 h', () => {
  const cfg = con({ reservarConHorasDeAnticipacion: 48 });
  assert.deepEqual(claves(turnosEnVentana(LUNES_17, cfg)), [
    '2026-11-02 19:00',
    '2026-11-03 08:00',
    '2026-11-03 14:00',
    '2026-11-03 19:00',
    '2026-11-04 08:00',
    '2026-11-04 14:00',
  ]);
});

test('un turno puede tener su propio cupo', async () => {
  const SEMANA = ['08:00', '14:00', { hora: '19:00', cupos: 1 }];
  const cfg = con({ horarios: { lunes: SEMANA, martes: SEMANA } });
  const db = await baseDePrueba();
  const libres = Object.fromEntries((await disponibilidad(db, LUNES_17, cfg)).map((t) => [`${t.fecha} ${t.hora}`, t.libres]));
  assert.deepEqual(libres, { '2026-11-02 19:00': 1, '2026-11-03 08:00': 15, '2026-11-03 14:00': 15 });

  await reservas.crearReserva(db, await crearUsuario(db, 'a@alumno.unlam.edu.ar'), '2026-11-02', '19:00', LUNES_17, cfg);
  await assert.rejects(
    reservas.crearReserva(db, await crearUsuario(db, 'b@alumno.unlam.edu.ar'), '2026-11-02', '19:00', LUNES_17, cfg),
    /ya no tiene lugares/
  );
});

test('tolerancia y «Llegué» salen de los parámetros', () => {
  const cfg = con({ toleranciaMinutos: 5, llegueDesdeMinutosAntes: 10 });
  const r = { estado: 'activa', fecha: '2026-11-02', hora: '19:00', llegada_registrada_en: null };
  const a19 = aEpoch('2026-11-02', '19:00');
  const MIN = 60 * 1000;
  assert.equal(reservas.puedeRegistrarLlegada(r, a19 - 11 * MIN, cfg), false);
  assert.equal(reservas.puedeRegistrarLlegada(r, a19 - 10 * MIN, cfg), true);
  assert.equal(reservas.puedeRegistrarLlegada(r, a19 + 5 * MIN, cfg), true);
  assert.equal(reservas.puedeRegistrarLlegada(r, a19 + 6 * MIN, cfg), false);
  assert.equal(reservas.estadoReserva(r, a19 + 6 * MIN, cfg), 'no_llego');
});
