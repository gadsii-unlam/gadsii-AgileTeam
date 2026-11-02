// Service worker mínimo: permite instalar la app y muestra un aviso si no hay conexión.
// No guarda pantallas con datos de reservas: siempre se piden al servidor.
const CACHE = 'unlam-parking-v1';
const ARCHIVOS = ['/sin-conexion.html', '/estilos.css', '/iconos/icono-192.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
  if (evento.request.mode !== 'navigate') return;
  evento.respondWith(fetch(evento.request).catch(() => caches.match('/sin-conexion.html')));
});
