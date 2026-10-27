// Jale: guarda la app para que abra rápido y aunque falle el internet. No guarda datos de la persona.
const VERSION = "jale-v2";
const ARCHIVOS = ["/", "/index.html", "/app.css", "/app.js", "/datos.js", "/icon.svg", "/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Primero internet (para tener siempre lo más nuevo); si no hay, lo guardado.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("/")))
  );
});
