// Lee y valida parametros.json: horarios, cupos, tolerancia, «Llegué» y anticipación para reservar.
// Es el único lugar donde se configuran (ver el bloque "_ayuda" del propio archivo).
const fs = require('node:fs');
const path = require('node:path');

const ARCHIVO = path.join(__dirname, 'parametros.json');

// Índice = día de la semana de Date (0 = domingo).
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const CLAVES = [
  'cuposPorTurno',
  'toleranciaMinutos',
  'llegueDesdeMinutosAntes',
  'reservarHastaMinutosAntes',
  'reservarConHorasDeAnticipacion',
  'horarios',
];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function entero(valor, nombre, min, max) {
  if (!Number.isInteger(valor) || valor < min || valor > max) {
    throw new Error(`"${nombre}" tiene que ser un número entero entre ${min} y ${max} (vino ${JSON.stringify(valor)})`);
  }
  return valor;
}

// Objeto del JSON -> parámetros que usa la app (mismos nombres que antes en config.js).
function validar(json) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('el archivo tiene que ser un objeto JSON');
  for (const clave of Object.keys(json)) {
    if (!clave.startsWith('_') && !CLAVES.includes(clave)) throw new Error(`clave desconocida "${clave}" (¿está bien escrita?)`);
  }
  for (const clave of CLAVES) {
    if (!(clave in json)) throw new Error(`falta la clave "${clave}"`);
  }

  const horarios = json.horarios;
  if (!horarios || typeof horarios !== 'object' || Array.isArray(horarios)) throw new Error('"horarios" tiene que ser un objeto con un día por clave');
  for (const dia of Object.keys(horarios)) {
    if (!DIAS.includes(dia)) throw new Error(`día desconocido "${dia}" en "horarios" (sin tildes: ${DIAS.join(', ')})`);
  }

  const turnos = [];
  const cupos = [];
  for (const dia of DIAS) {
    const lista = horarios[dia] ?? [];
    if (!Array.isArray(lista)) throw new Error(`"horarios.${dia}" tiene que ser una lista, por ejemplo ["08:00", "14:00"]`);
    const horas = [];
    const especiales = {};
    for (const item of lista) {
      const esObjeto = item && typeof item === 'object';
      const hora = esObjeto ? item.hora : item;
      if (typeof hora !== 'string' || !HORA.test(hora)) {
        throw new Error(`"horarios.${dia}": ${JSON.stringify(item)} no es una hora "HH:MM" válida`);
      }
      if (horas.includes(hora)) throw new Error(`"horarios.${dia}": el turno ${hora} está repetido`);
      if (esObjeto) {
        for (const k of Object.keys(item)) {
          if (k !== 'hora' && k !== 'cupos') throw new Error(`"horarios.${dia}" ${hora}: clave desconocida "${k}"`);
        }
        if ('cupos' in item) especiales[hora] = entero(item.cupos, `horarios.${dia} ${hora} cupos`, 0, 10000);
      }
      horas.push(hora);
    }
    turnos.push(horas.sort());
    cupos.push(especiales);
  }

  return {
    capacidad: entero(json.cuposPorTurno, 'cuposPorTurno', 0, 10000),
    toleranciaMin: entero(json.toleranciaMinutos, 'toleranciaMinutos', 0, 24 * 60),
    llegueDesdeMin: entero(json.llegueDesdeMinutosAntes, 'llegueDesdeMinutosAntes', 0, 24 * 60),
    anticipacionMin: entero(json.reservarHastaMinutosAntes, 'reservarHastaMinutosAntes', 0, 7 * 24 * 60),
    ventanaHoras: entero(json.reservarConHorasDeAnticipacion, 'reservarConHorasDeAnticipacion', 1, 7 * 24),
    turnos, // turnos[díaDeLaSemana] = ["08:00", ...]
    cupos, // cupos[díaDeLaSemana]["19:00"] = cupo propio de ese turno (si lo tiene)
  };
}

function leer(archivo = ARCHIVO) {
  let texto;
  try {
    texto = fs.readFileSync(archivo, 'utf8');
  } catch (error) {
    throw new Error(`No se pudo leer ${path.basename(archivo)}: ${error.message}`);
  }
  let json;
  try {
    json = JSON.parse(texto);
  } catch (error) {
    throw new Error(`${path.basename(archivo)} no es un JSON válido: ${error.message}`);
  }
  try {
    return validar(json);
  } catch (error) {
    throw new Error(`${path.basename(archivo)}: ${error.message}`);
  }
}

module.exports = { ARCHIVO, DIAS, validar, leer };
