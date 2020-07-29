const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let clients = {};

app.get('/', (req, res) => {
  res.json({status: 'ok'});
});

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    clients[socket.id] = {
      name,
      vote: ''
    };
    io.emit('update', clients)
  });

  socket.on('send', (vote) => {
    clients[socket.id].vote = vote;
    io.emit('update', clients);
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnect');
    delete clients[socket.id];
    io.emit('update', clients);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});