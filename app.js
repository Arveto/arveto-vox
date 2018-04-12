var http = require('http');
var app = require('express')();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res, next){
    res.send("Hello world! Server incoming!");
});

server.listen(8080);
