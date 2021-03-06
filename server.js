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
var list = [];

io.on('connection', function(socket) { 
  var name = "익명" + count++;
  socket.name = name;
  console.log('user connected: ', socket.id, socket.name);
  var msg = '&lt;Notice&gt; '+socket.name+' is connected.';
  list = list.concat(socket.name);
  io.emit('receive message', msg);
  io.to(socket.id).emit('create name', name); // 왜 socket.emit안하고?

  io.emit('receive list', list);

  socket.on('change name', function(name) {
    console.log('changed name', socket.name, name);
    var msg = '&lt;Notice&gt; '+socket.name+' changed to '+name+'.';
    list = list.map((item) => {
      return item === socket.name ? name : item;
    });
    socket.name = name;
    io.emit('receive message', msg);
    io.emit('receive list', list);
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.id + ' ' + socket.name);
    var msg = '&lt;Notice&gt; '+socket.name+' is disconnected.';
    io.emit('receive message', msg);
    list = list.filter((item) => {
      return item !== socket.name;
    })
    io.emit('receive list', list);
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
