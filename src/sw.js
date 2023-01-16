
self.addEventListener('message', function(event) {
    var data = event.data;

    console.log("SW Received Message:");
    console.log(data);

    self.userID = data.uid;
    self.userToken = data.token;

});
