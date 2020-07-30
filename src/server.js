const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let rooms = {}

app.get('/', (req, res) => {
  res.json({status: 'ok'});
});

app.get('/cleanRooms', (req, res) => {
  rooms = {}
  res.json({Clean: 'ok'});
});

io.on('connection', (socket) => {
  socket.on('join', (info) => {
    const { userName, room } = info

    if (!rooms[room]) {
      rooms[room] = {}
    }

    rooms[room][socket.id] = {
      name: userName,
      vote: ''
    };
    socket.join(room)
    io.to(room).emit('update', rooms[room])
  });

  socket.on('send', (info) => {
    const { vote, room } = info
    rooms[room][socket.id].vote = vote;
    io.to(room).emit('update', rooms[room]);
  });

  socket.on('clearVotes', (info) => {
    const { room } = info

    const clientKeys = Object.keys(rooms[room])
    clientKeys.forEach((client) => {
      rooms[room][client].vote = '';
    })
    io.to(room).emit('clearCardVote');
    io.to(room).emit('update', rooms[room]);
  });

  socket.on('showVotes', (info) => {
    const { room } = info
    io.to(room).emit('showVotes', rooms[room]);
  })
  
  socket.on('disconnect', () => {
    Object.entries(rooms).forEach(room => {
      if (room[1][socket.id]) {
        delete rooms[room[0]][socket.id]
        io.to(room[0]).emit('update', rooms[room[0]])
      }
    })
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});