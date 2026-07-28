// EatScan PWA Service Worker
const CACHE_NAME = "eatscan-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass through fetch requests for real-time SSE & API
  event.respondWith(fetch(event.request));
});
