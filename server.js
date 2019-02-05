var
express		= require('express'),
path		= require('path'),
app			= express(),
http		= require('http').Server(app),
io			= require('socket.io')(http),
settings 	= require('./src/settings.js');

var players = new Map();
var nof_games = 0;
var games = new Map();
var available_player = 0;

app.use(express.static(path.join(__dirname, './www/')));

app.get('/', function(req, res) {
	res.sendFile('./index.html');
})

http.listen(4040, function(){
	console.log('Chat server listening on *:4040');
});



io.on('connection', function(socket){
	var addedUser = false;

	players.set(socket.id, {});

	players.get(socket.id).gameId = nof_games;

	socket.join(nof_games);

	if(available_player == 0){
		available_player = 1;
	}
	else{
		nof_games = nof_games + 1;	
		available_player = 0;
	}

	//console.log(socket);

	socket.on('disconnect', function(){
		//leaveRoom(socket);
		console.log('user left');
	});

	socket.on('set-name', function(data) {
		if(addedUser)
			return ;
		players.get(socket.id).name = data.name;
		console.log('User has set the name: ' + players.get(socket.id).name);
		socket.broadcast.to(players.get(socket.id).gameId).emit('user-joined', players.get(socket.id).name);
		addedUser = true;
	});

	socket.on('chat-message', function(text) {
		console.log(players.get(socket.id).name + ': ' + text);
		socket.broadcast.to(players.get(socket.id).gameId).emit('chat-message', players.get(socket.id).name + ': ' + text);
	});

	console.log('User connected.');
});

//one room can be kept as a waiting room for all the yet to be assigned clients.
