const config = require('./config');
const { abrir } = require('./db/db');
const { crearApp } = require('./app');

const db = abrir();
const app = crearApp({ db });

const servidor = app.listen(config.puerto, config.host, () => {
  console.log(`Unlam Parking escuchando en http://${config.host}:${config.puerto}`);
  console.log(`Base de datos: ${config.rutaBase}`);
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
