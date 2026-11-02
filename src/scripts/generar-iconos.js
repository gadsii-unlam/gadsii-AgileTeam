// Genera los íconos PNG de la app (una "P" blanca sobre verde) sin dependencias externas.
// Uso: npm run iconos
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const VERDE = [0x0b, 0x5d, 0x3b];
const BLANCO = [0xff, 0xff, 0xff];

function esLetra(u, v) {
  if (u >= 0.3 && u <= 0.42 && v >= 0.22 && v <= 0.78) return true; // palo de la P
  const d = Math.hypot(u - 0.47, v - 0.4);
  return u >= 0.36 && d >= 0.08 && d <= 0.19; // panza de la P
}

const tablaCrc = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = tablaCrc[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloque(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function png(tamano) {
  const filas = [];
  for (let y = 0; y < tamano; y++) {
    const fila = Buffer.alloc(1 + tamano * 3);
    for (let x = 0; x < tamano; x++) {
      const color = esLetra((x + 0.5) / tamano, (y + 0.5) / tamano) ? BLANCO : VERDE;
      fila.set(color, 1 + x * 3);
    }
    filas.push(fila);
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(tamano, 0);
  cabecera.writeUInt32BE(tamano, 4);
  cabecera.set([8, 2, 0, 0, 0], 8); // 8 bits, RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', zlib.deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ]);
}

const destino = path.join(__dirname, '..', 'public', 'iconos');
fs.mkdirSync(destino, { recursive: true });
for (const tamano of [180, 192, 512]) {
  fs.writeFileSync(path.join(destino, `icono-${tamano}.png`), png(tamano));
}
console.log(`Íconos generados en ${destino}`);
