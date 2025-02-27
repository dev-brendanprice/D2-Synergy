
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

        console.log('🥝 Installing Service Worker');

        try {

            serviceWorker = await navigator.serviceWorker.register('./sw.js', { scope: '../../', type: 'module' });
            if (serviceWorker.active) {

                console.log('🥝 Service Worker Active');
        
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log(event.data);
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