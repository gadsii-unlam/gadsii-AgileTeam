// La app entera corre como una función de Netlify. netlify.toml redirige todas las rutas que
// no son archivos estáticos (public/) a esta función.
// Necesita las variables de entorno TURSO_DATABASE_URL y TURSO_AUTH_TOKEN (ver README).
const serverless = require('serverless-http');
const { abrir } = require('../../db/db');
const { crearApp } = require('../../app');

// Se reutiliza mientras la instancia de la función siga viva ("warm").
let manejador = null;

async function preparar() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('Falta configurar TURSO_DATABASE_URL en las variables de entorno de Netlify');
  }
  const db = await abrir();
  return serverless(crearApp({ db, confiarProxy: true }), { basePath: '/.netlify/functions/app' });
}

exports.handler = async (event, context) => {
  if (!manejador) {
    manejador = preparar().catch((error) => {
      manejador = null; // reintentar en el próximo pedido
      throw error;
    });
  }
  return (await manejador)(event, context);
};
