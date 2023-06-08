import { log } from '../user.js';

let serviceWorker;

export async function PostMessage(data) {
    serviceWorker.active.postMessage(data);
};

export function PostMessageSync(data) {
    serviceWorker.active.postMessage(data);
};

// Register service worker to load definitions (non blocking)
export async function RegisterServiceWorker () {

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {

        log('🥝 Installing Service Worker');

        try {

            serviceWorker = await navigator.serviceWorker.register('./sw.js', { scope: '../../', type: 'module' });
            if (serviceWorker.active) {

                log('🥝 Service Worker Active');
        
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    log(event.data);
                });
            };
        }
        catch (err) {
            console.error(err);
        };

        return;
    };

    // Else do conventional fetch
    // -- something
};