var app = require('../index.js');
var should = require('should');
var expect = require('expect');
var io = require('socket.io-client');
var socketURL = 'http://localhost:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = 'testuser1';
var chatUser2 = 'testuser2';
var chatUser3 = 'testuser3';

describe("Chat Server",function(){
 it('Connect and broadcast new user to all users', function(done){
	var client1 = io.connect(socketURL, options);
	client1.on('connect', function(data){
		client1.emit('join', chatUser1);
		var client2 = io.connect(socketURL, options);
		client2.on('connect', function(data){
		client2.emit('join', chatUser2);
    });

    client2.on('update', function(usersName){
		//usersName.should.equal('You have connected to the Public Group.');
		usersName.should.equal(chatUser2);
		client2.disconnect();
    });
  });

  var numUsers = 0;
  client1.on('update', function(usersName){
    numUsers += 1;
    if(numUsers === 2){
      usersName.should.equal(chatUser2 + " has joined the conversation.");
      client1.disconnect();
      done();
    }
  });
});

it('Broadcast message', function(){
	var testMessage = 'Test';
	var msgcnt=0;
	var checkMessage = function(client){
		client.on('chat', function(msg){
			testMessage.should.equal(msg);
			client.disconnect();
			msgcnt++;
				if(msgcnt === 3){
					console.log("done");
				};
		});
    };
	
	//joining 3 clients
	var client1 = io.connect(socketURL, options);
	client1.on('connect', function(data){
		client1.emit('join', chatUser1);
		checkMessage(client1);
		
		var client2 = io.connect(socketURL, options);
		client2.on('connect', function(data){
		client2.emit('join', chatUser2);
		checkMessage(client2);
		client2.send(testMessage);
    });
	
	var client3 = io.connect(socketURL, options);
		client3.on('connect', function(data){
			client3.emit('join', chatUser3);
				checkMessage(client3);
    });
  });

 
});
it('Connect to Public group by default', function(done){
  var client1 = io.connect(socketURL, options);

  client1.on('connect', function(data){
    client1.emit('join', chatUser1);

    /* Since first client is connected, we connect
    the second client. */
    var client2 = io.connect(socketURL, options);

    client2.on('connect', function(data){
      client2.emit('join', chatUser2);
    });

    client2.on('update', function(usersName){
		usersName.should.equal(chatUser2);
      //usersName.should.equal(chatUser2 + " has joined.");
		//usersName.should.equal('You have connected to the Public Group.');
      client2.disconnect();
		});
   });

  var numUsers = 0;
  client1.on('updategroups', function(rooms, roomType){
    numUsers += 1;
	
    if(roomType.should.equal('Public Group')){
      client1.disconnect();
      done();
    }
  });
});
//Group caht
 it('Adding Group', function(done){
   var client = io.connect(socketURL, options);
   var newGroupName = 'TestGroup';
   client.on('connect', function(data){ 
    client.emit('addGroup', newGroupName);
   });
   client.on('updategroups', function(user,groupName){
    groupName.should.equal(newGroupName);
	client.disconnect();
    done();
   });
 }); 
 
 
 it('Checking group message', function(done){
   var client = io.connect(socketURL, options);
   var newGroupName = 'TestGroup';
   client.on('connect', function(data){
    client.emit('addGroup', newGroupName);
   });
   client.on('update', function(msg){
    msg.should.equal('you have connected to '+newGroupName);
    client.disconnect();
    done();
   });
 }); 
 
 it('Switching Group', function(done){
   var client = io.connect(socketURL, options);
   var newGroupName = 'TestGroup';
   client.on('connect', function(data){
    client.emit('switchGroup', newGroupName);
   });
   client.on('updategroups', function(rooms,newgroup){
    newGroupName.should.equal(newgroup);
    client.disconnect();
    done();
   });
 }); 
 
 it('Checking group message after switching user', function(done){
   var client = io.connect(socketURL, options);
   var newGroupName = 'TestGroup';
   client.on('connect', function(data){
    client.emit('switchGroup', newGroupName);
   });
   client.on('update', function(msg){
    msg.should.equal('you have connected to '+ newGroupName);
    client.disconnect();
    done();
   });
 }); 

it('Adding user to Group', function(done){
   var client = io.connect(socketURL, options);
   var newGroupName = 'TestGroup';
   var client2 = io.connect(socketURL, options);
   client.on('connect', function(data){
    client2.emit('addGroup', newGroupName);
    client2.emit('addUserToGroup', newGroupName)
   });
   client2.on('updateusergroups', function(group){
    group.should.equal(newGroupName);
    client.disconnect();
    client2.disconnect();
    done();
   });
 }); 
 
it('Sending Private messages',function(done)
{
var message ="Secret message";
reciever='chatUser1';
sender='chatUser3';
 var messages = 0;
  
  var completeTest = function(){
    messages.should.equal(1);
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    done();
  };

  var checkPrivateMessage = function(client){
    client.on('updatePrivateChat', function(sender1, reciever , msg){
      message.should.equal(msg);
      sender.should.equal(sender1);
     
      if(client === client1){
	   messages++;
       completeTest();
      };
    });
  };
 
 var client1 = io.connect(socketURL, options);
  client1.on('connect', function(data){
    client1.emit('join', chatUser1);
  checkPrivateMessage(client1);
  });
  var client2 = io.connect(socketURL, options);
  client2.on('connect', function(data){
    client2.emit('join', chatUser2);
 checkPrivateMessage(client2);
  });
    var client3 = io.connect(socketURL, options);
  client3.on('connect', function(data){
    client3.emit('join', chatUser3);
	 checkPrivateMessage(client3);
	 client3.emit('sendPrivateMessage' ,sender, reciever ,message) 
   });
 });
  it('Should check the length propoerty', function() {
 var client2 = io.connect(socketURL, options);
  client2.on('update-people', function(usrlist){
 expect( usrlist ).to.have.length( 1 );
  });  
});

it('Disconnect User', function(){
  var client1 = io.connect(socketURL, options);
  client1.on('connect', function(data){
    client1.emit('join', chatUser1);
  });
  var client2 = io.connect(socketURL, options);
  client2.on('connect', function(data){
    client2.emit('join', chatUser2);
  });
  var numUsers = 0;
  client1.on('update', function(usersName){
   client1.disconnect();
    numUsers -= 1;
    if(numUsers === 1){
      usersName.should.equal(chatUser1 + " has left the server..");
      done();
    }
  });
  });
});
 
