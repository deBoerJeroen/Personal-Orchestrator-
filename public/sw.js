/**
 * Minimale service worker: alleen een offline shell.
 *
 * Bewust géén caching van persoonlijke data — die staat dan op het apparaat
 * buiten de sessie om. Push komt pas in fase 4.
 */
const CACHE = "nu-shell-v1";
const SHELL = ["/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Network-first: verse data wint altijd van een oude cache.
  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      return cached ?? caches.match("/offline");
    }),
  );
});
