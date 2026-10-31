// Levanta el servidor y un túnel rápido de Cloudflare para tener una URL pública.
// Funciona igual en Windows y en Linux. La URL cambia cada vez que se corre.
// Uso: npm run publicar   (Ctrl+C para cortar)
const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const config = require('../config');
const { abrir } = require('../db/db');
const { mostrarQr } = require('./qr-url');

const RAIZ = path.join(__dirname, '..');
const DATA = path.join(RAIZ, 'data');
const LOCAL = `http://127.0.0.1:${config.puerto}`;

const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function servidorResponde() {
  try {
    return (await fetch(`${LOCAL}/salud`, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
}

function salirConError(mensaje) {
  console.error(`\n${mensaje}`);
  process.exit(1);
}

async function main() {
  if (await servidorResponde()) {
    salirConError(
      `Ya hay un servidor corriendo en el puerto ${config.puerto} (¿quedó abierto un 'npm start' u otro 'npm run publicar'?).\n` +
        'Cerralo y volvé a correr este comando.'
    );
  }

  fs.mkdirSync(DATA, { recursive: true });
  const db = abrir();
  const cuentas = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
  db.close();
  if (cuentas === 0) {
    console.log('No hay cuentas cargadas: corriendo el seed...');
    spawnSync(process.execPath, ['scripts/seed.js'], { cwd: RAIZ, stdio: 'inherit' });
  }
  spawnSync(process.execPath, ['scripts/backup.js'], { cwd: RAIZ, stdio: 'inherit' });

  const procesos = [];
  let cortando = false;
  const cortarTodo = (codigo) => {
    cortando = true;
    for (const p of procesos) p.kill();
    process.exit(codigo);
  };
  process.on('SIGINT', () => cortarTodo(0));
  process.on('SIGTERM', () => cortarTodo(0));

  const servidor = spawn(process.execPath, ['server.js'], { cwd: RAIZ, stdio: 'inherit' });
  procesos.push(servidor);
  // Con Ctrl+C la terminal también corta a los hijos: se espera un instante para no avisar de más.
  const alTerminar = (mensaje) => () =>
    setTimeout(() => {
      if (cortando) return;
      console.error(`\n${mensaje} Volvé a correr "npm run publicar".`);
      cortarTodo(1);
    }, 300);
  servidor.on('exit', alTerminar('Se detuvo el servidor: la URL ya no funciona.'));

  for (let i = 0; i < 30 && !(await servidorResponde()); i++) await esperar(500);
  if (!(await servidorResponde())) salirConError('El servidor no pudo arrancar. Revisá los mensajes de arriba.');

  const log = fs.createWriteStream(path.join(DATA, 'cloudflared.log'));
  const tunel = spawn('cloudflared', ['tunnel', '--no-autoupdate', '--url', LOCAL], { stdio: ['ignore', 'pipe', 'pipe'] });
  procesos.push(tunel);
  tunel.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error('\nFalta instalar cloudflared. Ver la sección "Publicar" del README.');
    } else {
      console.error(`\nNo se pudo iniciar cloudflared: ${error.message}`);
    }
    cortarTodo(1);
  });
  tunel.on('exit', alTerminar('Se cortó el túnel: la URL ya no funciona.'));

  let url = null;
  const buscarUrl = async (trozo) => {
    log.write(trozo);
    const encontrada = !url && String(trozo).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (!encontrada) return;
    url = encontrada[0];
    fs.writeFileSync(path.join(DATA, 'url-publica.txt'), `${url}\n`);
    console.log('\n==============================================================');
    console.log('  Unlam Parking publicado en:');
    console.log(`  ${url}`);
    console.log('  (también quedó guardado en data/url-publica.txt)');
    console.log('==============================================================\n');
    await mostrarQr(url);
    console.log('\nDejá esta terminal abierta. Ctrl+C para cortar.');
    console.log('Si la URL no carga enseguida, esperá unos segundos y recargá.\n');
  };
  tunel.stdout.on('data', buscarUrl);
  tunel.stderr.on('data', buscarUrl);

  await esperar(60000);
  if (!url) salirConError('No se pudo obtener la URL del túnel. Revisá data/cloudflared.log');
}

main();
