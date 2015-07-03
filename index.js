var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);




var people = {}; 
// rooms which are currently available in chat
var rooms = [new Object()]; 
rooms[0].name = 'Public Group';
rooms[0].users = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname + '/public'));

io.on('connection', function(client){
  
  client.on('join', function(name){
  people[client.id] = name;
	
	// store the username in the socket session for this client
		client.username = name;
	// store the room name in the socket session for this client
		client.room = 'Public Group';
	//Add user to group1
		rooms[0].users.push(name);
	// send client to public group
		client.join('Public Group');
		client.emit("update", "You have connected to the Public Group.");

		client.broadcast.to('Public Group').emit("update", name + " has joined the conversation.");
		io.emit("update-people", people);
		io.emit('updategroups', rooms, 'Public Group');
    
  });
  
  client.on("send", function(msg){
        io.sockets.in(client.room).emit("chat", people[client.id], msg);
    });

    client.on('user image', function (msg) {
      client.broadcast.emit('user image', people[client.id], msg);
    });
	client.on("disconnect", function(){
        io.sockets.emit("update", people[client.id] + " has left the server.");
        delete people[client.id];
        io.sockets.emit("update-people", people);
    });
	
	// Add Group Logic
		client.on('addGroup', function (data) {
		var newroom = new Object();
		newroom.name = data;
		newroom.users = [client.username];
		rooms.push(newroom);
		client.leave(client.room);
		client.join(data);
		client.emit('update', 'you have connected to '+ data);
		// sent message to OLD room
		client.broadcast.to(client.room).emit('update', client.username+' has left this conversation');
		// update socket session room title
		client.room = data;
		client.broadcast.to(data).emit('update', client.username+' has joined this conversation');
		client.emit('updategroups', rooms, data);
		
		
	});

	// Add User Logic
		client.on('addUserToGroup', function (username) {
		
		rooms.forEach( function( value) {
		
				if(value.name == client.room){
					value.users.push(username);
					io.emit('updateusergroups', username,client.room);
				}
			});
		
		});
		
	//Switch Group
	client.on('switchGroup', function(newgroup){
		client.leave(client.room);
		client.join(newgroup);
		client.emit('update', 'you have connected to '+ newgroup);
		// sent message to OLD room
		client.broadcast.to(client.room).emit('update', client.username+' has left this room');
		// update socket session room title
		client.room = newgroup;
		client.broadcast.to(newgroup).emit('update', client.username+' has joined this room');
		client.emit('updategroups', rooms, newgroup);
	});
		
		client.on('LOG', function (msg) {
				console.log(msg);
		});
  
});

io.on('disconnect', function(){
    console.log('user disconnected');
  });
http.listen(3000, function(){
  console.log('listening on *:3000');
});



