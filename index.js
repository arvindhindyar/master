var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var people = {};  


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


app.use(express.static(__dirname + '/public'));

io.on('connection', function(client){
  
  client.on('join', function(name){
  people[client.id] = name;
  	client.emit("update", "You have connected to the server.");
    io.sockets.emit("update", name + " has joined the server.");
    io.sockets.emit("update-people", people);
    
  });
  
  client.on("send", function(msg){
        io.sockets.emit("chat", people[client.id], msg);
    });


	client.on("disconnect", function(){
        io.sockets.emit("update", people[client.id] + " has left the server.");
        delete people[client.id];
        io.sockets.emit("update-people", people);
    });
  
});

io.on('disconnect', function(){
    console.log('user disconnected');
  });
http.listen(3000, function(){
  console.log('listening on *:3000');
});



