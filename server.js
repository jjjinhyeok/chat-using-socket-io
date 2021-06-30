var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => { // /접속 시 render chat.pug
  res.render('chat');
});

var count=1; // count users

io.on('connection', function(socket) { 
  var name = "익명" + count++;
  socket.name = name;
  console.log('user connected: ', socket.id, socket.name);
  io.to(socket.id).emit('create name', name); // 왜 socket.emit안하고?

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.id + ' ' + socket.name);
  });

  socket.on('send message', function(name, text) {
    var msg = name + ' : ' + text;
    socket.name = name;
    console.log(msg);
    io.emit('receive message', msg);
  });
});

http.listen(3000, function() {
  console.log('server on...');
});