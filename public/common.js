var username;
$(document).ready(function(){  
        var socket = io.connect();
        $("#chat").hide();
		$("#privateChatDiv").hide();
	    $(".privateChat1").hide();
        $("#name").focus();
        $("form").submit(function(event){
            event.preventDefault();
        });

        $("#join").click(function(){
        
        $('#login').style.display='none';
        $('#fade').style.display='none';
        
            var name = $("#name").val();
            if (name != "") {
                socket.emit("join", name);
                $("#login").detach();
                $("#chat").show();
                $("#msg").focus();
                ready = true;
            }
        });

        $("#name").keypress(function(e){
            if(e.which == 13) {
                var name = $("#name").val();
                if (name != "") {
				username = name;
				document.getElementById('currentUserName').innerHTML = name;
                    socket.emit("join", name);
                    ready = true;
                    $("#login").detach();
                    $("#chat").show();
					$("#privateChatDiv").show();
					$(".privateChat1").show();
                    $("#msg").focus();
                }
            }
        });

        socket.on("update", function(who,msg) {
            if(ready)
            {
                $('#lines').append($('<p>').append($('<b>').text(who +': '), msg));
                }
        })

        socket.on("update-people", function(people){
		
            if(ready) {
                $("#people").empty();
                $.each(people, function(clientid, name) {
					if (name != username)
                    $('#people').append('<li class="userName"><a href=#>' + name + '</a></li>');
                });
            }
        });

        socket.on("chat", function(who, msg){
            if(ready) {
                 $('#lines').append($('<p>').append($('<b>').text(who +': '), msg));
            }
        });

        socket.on("disconnect", function(){
            $("#lines").append("The server is not available");
            $("#msg").attr("disabled", "disabled");
            $("#send").attr("disabled", "disabled");
        });
		
		// listener, whenever the server emits 'updaterooms', this updates the room the client is in
		socket.on('updategroups', function(groups, current_group) {
		
			$('#rooms').empty();
			groups.forEach( function( value) {
			function checkuser(element, index, array)
			{	
			return element == username;}
			
			if(value.users.some(checkuser)){
					if(value.name == current_group){
						if(current_group != 'Public Group')
							$('#rooms').append('<li>' + value.name + '<input type="button" class="adduserButton" value="Add user"/></li>');
						else
							$('#rooms').append('<li>' + value.name + '</li>');
					}
					else {
						$('#rooms').append('<li class="groupName"><a href=#>' + value.name + '</a></li>');
					}
				}
			});
			
		});
		
		socket.on('updateusergroups', function(user,groupname) {
			
			if(user==username){
						$('#rooms').append('<li class="groupName"><a href=#>' + groupname + '</a></li>');
				}
			});
			
		socket.on('updatePrivateChat', function(sender, msg) {
				document.getElementById('userName').innerHTML = sender;
						$('#privateMsgList').append('<li>' + sender + ": " + msg + '</li>');
				
			});
			
		

	
		$(document).on("click", ".groupName", function(){ 
        var clickedGroup = $(this).text();
            socket.emit('switchGroup', clickedGroup);
		}); 

		$(document).on("click", ".adduserButton", function(){ 
        socket.emit('addUserToGroup', prompt("Enter Username "));
		});
		
		$(document).on("click", ".userName", function(){ 
         var clickedUserName = $(this).text();
		 document.getElementById('userName').innerHTML = clickedUserName;
		 $('#privateMsgList').empty();
		});
		
        $("#send").click(function(){
            var msg = $("#msg").val();
            socket.emit("send", msg);
            $("#msg").val("");
            $("#msgsDiv").scrollTop(10000);
            $('#lines').get(0).scrollTop = $("#lines").get(0).scrollHeight;
        });
		
		$("#sendPrivate").click(sendPrivate());
		
		$("#privateMsg").keypress(function(e){
            if(e.which == 13) {
                sendPrivate();
            }
        });
		
		function sendPrivate(){
            var msg = $("#privateMsg").val();
			if(msg) {
				var receiver = document.getElementById('userName').innerHTML;
				$("#privateMsg").val("");
				$('#privateMsgList').append('<li>me: ' + msg + '</li>');
				socket.emit("sendPrivateMessage", username, receiver, msg);
			}
        }

        $("#msg").keypress(function(e){
            if(e.which == 13) {
                var msg = $("#msg").val();
                socket.emit("send", msg);
                $("#msg").val("");
            }
        });
		
		$("#addGroupButton").click(function(){
			var name = prompt("Enter new group name ");
			if (name != "" || name != null) {
			socket.emit('addGroup', name);
			}
        });

        socket.on('user image', image); 
       function image (from, base64Image) {
    $('#lines').append($('<p>').append($('<b>').text(from),'<img width="300" height="300" src="' + base64Image + '"/>'));
  }
  
  $('#imagefile').bind('change', function(e){
      var data = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function(evt){
        image('me', evt.target.result);
        socket.emit('user image', evt.target.result);
      };
      reader.readAsDataURL(data);
      
    }); 

    });