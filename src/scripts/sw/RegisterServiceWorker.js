import { log } from '../user.js';

// Register service worker to load definitions (non blocking)
export const RegisterServiceWorker = async function () {

    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
        const serviceWorker = await navigator.serviceWorker.register('./sw.js', { scope: './', type: 'module' });

        log('🥝 Installing Service Worker');
        if (serviceWorker.active) {
            log('🥝 Service Worker Active');
    
            serviceWorker.active.postMessage('🥝 HELLO FROM MAIN');
    
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                log('🥝', event.data);
            });
        };

        return;
    };

    // Else do conventional fetch
    // -- something
};