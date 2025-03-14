/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build,  // the app itself
    ...files   // everything in `static`
];

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

sw.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
    }

    event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
    // Ignore POST requests etc
    if (event.request.method !== 'GET') return;

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // Try the cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
            // If not in cache, get from network
            const response = await fetch(event.request);

            // Cache successful responses
            if (response.ok) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch {
            // If offline and not in cache, return a fallback
            return new Response('Offline', { status: 408 });
        }
    }

    event.respondWith(respond());
});