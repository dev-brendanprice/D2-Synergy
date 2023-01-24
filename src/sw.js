
const log = console.log.bind(console);

self.addEventListener('message', function(event) {
    
    let data = event.data;
    log(data);

    self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage('Hello from SW');
        });
    });
});
