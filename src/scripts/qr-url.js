// Muestra en la terminal un QR con la URL pública y lo guarda como PNG para compartirlo.
// Es una herramienta del equipo para pasar el link: la app no muestra ningún QR.
// Uso: node scripts/qr-url.js https://algo.trycloudflare.com
const path = require('node:path');
const QRCode = require('qrcode');

async function mostrarQr(url) {
  const png = path.join(__dirname, '..', 'data', 'url-publica.png');
  console.log(await QRCode.toString(url, { type: 'terminal', small: true }));
  await QRCode.toFile(png, url, { width: 600, margin: 2 });
  console.log(`QR guardado en ${png}`);
}

if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('Uso: node scripts/qr-url.js <url>');
    process.exit(1);
  }
  mostrarQr(url);
}

module.exports = { mostrarQr };
