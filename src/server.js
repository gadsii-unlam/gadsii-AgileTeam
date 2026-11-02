// Servidor para desarrollo local. En Netlify la app corre como función (netlify/functions/app.js).
const config = require('./config');
const { abrir } = require('./db/db');
const { crearApp } = require('./app');

async function main() {
  const db = await abrir();
  const app = crearApp({ db });

  const servidor = app.listen(config.puerto, config.host, () => {
    console.log(`Unlam Parking escuchando en http://localhost:${config.puerto}`);
    console.log(`Base de datos: ${config.db.url.startsWith('file:') ? config.db.url : 'Turso (remota)'}`);
  });

  // Cerrar la base prolijamente al cortar con Ctrl+C.
  for (const senal of ['SIGINT', 'SIGTERM']) {
    process.on(senal, () => {
      servidor.close(() => {
        db.close();
        process.exit(0);
      });
    });
  }
}

main();
