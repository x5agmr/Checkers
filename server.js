var
express		= require('express'),
path		= require('path'),
app			= express(),
http		= require('http').Server(app),
io			= require('socket.io')(http),
settings 	= require('./src/settings.js');

var players_opp_map = new Map();
var players = new Map();
var nof_games = 0;
var available_player = 0;

app.use(express.static(path.join(__dirname, './www/')));

app.get('/', function(req, res) {
	res.sendFile('./index.html');
})

http.listen(4040, function(){
	console.log('Chat server listening on *:4040');
});



io.on('connection', function(socket){
	
	players.set(socket.id, {});
	if(available_player == 0){
		available_player = 1;
	}
	else{
		nof_games = nof_games + 1;	
		available_player = 0;
	}

	players.get(socket.id).gameId = nof_games;

	socket.join(nof_games);

	socket.on('disconnect', function(){
		//leaveRoom(socket);
		console.log('user left');
	});

	socket.on('set-name', function(data) {
		players.get(socket.id).name = data.name;
		console.log('User has set the name: ' + players.get(socket.id).name);
		//addToRoom(socket, settings.defaultRoomId);
		socket.broadcast.to(players.get(socket.id).gameId).emit('user-joined', players.get(socket.id).name);
	});

	socket.on('chat-message', function(text) {
		console.log(players.get(socket.id).name + ': ' + text);
		
		socket.broadcast.to(players.get(socket.id).gameId).emit('chat-message', players.get(socket.id).name + ': ' + text);
		//socket.broadcast.to(socket.chat.room).emit('chat-message', socket.chat.name + ': ' + text)
	});

	socket.on('join-room', function(id){
		//socket.leave(socket.chat.room)
		//leaveRoom(socket);	
		//addToRoom(socket, id);
		console.log("join-room request");
		socket.join
	});

	console.log('User connected.');
});

function addToRoom(socket, roomId) {
	var roomName = settings.rooms[roomId]
	socket.join(roomName);
	socket.chat.room = roomName;
	var clients = io.sockets.adapter.rooms[roomName];

	var roomsData = [];
	for (var i = 0; i < settings.rooms.length; i++) {
		var clients = io.sockets.adapter.rooms[settings.rooms[i]];
		var count = 0;

		if (clients) {
			count = Object.keys(clients).length;
		}

		roomsData.push({
			id: i,
			name: settings.rooms[i],
			count: count
		});
	};

	socket.emit('set-room', roomId);
	var count =  clients ? Object.keys(clients).length : 0;
	socket.broadcast.to(roomName).emit('user-joined', socket.chat.name);
	io.sockets.emit('update-rooms', roomsData);
}

function leaveRoom(socket) {
	var roomsData = [];
	for (var i = 0; i < settings.rooms.length; i++) {
		var clients = io.sockets.adapter.rooms[settings.rooms[i]];
		var count = 0;

		if (clients) {
			count = Object.keys(clients).length;
		}

		roomsData.push({
			id: i,
			name: settings.rooms[i],
			count: count
		});
	};

	socket.broadcast.to(socket.chat.room).emit('user-left', socket.chat.name);
	io.sockets.emit('update-rooms', roomsData);
}