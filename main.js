const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'https://code.addmask.com',  // Allow this specific domain
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

// Allow cross-origin requests from your client domain (adjust as needed)
app.use(cors({
  origin: 'https://code.addmask.com', // Replace with your actual client domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
})); 

// Store player data (if needed)
let players = {}; 

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  io.to(socket.id).emit('your_id', { id: socket.id });

  // Initialize player entry
  players[socket.id] = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    direction: "idle"
  };
  
  socket.on('player-movement', (data) => {
    players[socket.id]["position"] = data.position;
    players[socket.id]["rotation"] = data.rotation;
    players[socket.id]["direction"] = data.direction;

    socket.broadcast.emit('playerMoved', { 
        id: socket.id, 
        movementData: data.position, 
        rotationData: data.rotation,
        direction: data.direction
    });
  });

  socket.on('sendDamageEvent', (data) => {
    io.to(data.id).emit('recieveDamageEvent', { 
      playersent: data.playersent,
      damage: data.damage
    });
  });
  
  socket.on('shoot', (data) => {
    socket.broadcast.emit('playerShot', { 
        id: socket.id, 
        position: data.position, 
        direction: data.direction,
        gun:gun
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', { id: socket.id });
  });
});

server.listen(3000, () => {
  console.log('Server is running');
});
