self.addEventListener('message', function(event) {
    
    self.clients.matchAll().then( function(clients) {
        clients.forEach( function(client) {
            client.postMessage(event.data);
        });
    });
});