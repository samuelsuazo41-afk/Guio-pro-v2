const CACHE_NAME = 'Pro-Guion-v35';
const urlsToCache = [
  './',
  './index.html?v=7',
  './styles.css?v=12',
  './main.js?v=7',
  './manifest.json?v=2',
  './data/loaderjson.js',
  './core/generadorlilibre.js',
  './data/banco_ecenes.json',
  './data/banco_emocions.json',
  './data/banco_escenarios.json',
  './data/banco_estructura.json',
  './data/banco_generes.json',
  './data/banco_lectura.json',
  './data/banco_olors.json',
  './data/banco_personatge.json',
  './data/banco_sons.json',
  './data/banco_ubicacion.json',
  './data/determinants.json',
  './icon-192.png?v=2',
  './icon-512.png?v=2',
  './icon-512-maskable.png?v=2'
];

// Instal·lació: cachejar i activar immediatament
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activació: esborrar caches velles i prendre control
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self
