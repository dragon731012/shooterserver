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
  socket.emit('your_id', { id: socket.id });

  // Initialize player entry
  players[socket.id] = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  };
  
  socket.on('player-movement', (data) => {
    players[socket.id]["position"] = data.position;
    players[socket.id]["rotation"] = data.rotation;
    players[socket.id]["direction"] = data.direction;

    // Broadcast to everyone except the sender
    socket.broadcast.emit('playerMoved', { 
        id: socket.id, 
        movementData: data.position, 
        rotationData: data.rotation,
        direction: data.direction
    });
  });
  
  socket.on('shoot', (data) => {
    socket.broadcast.emit('playerShot', { 
        id: socket.id, 
        position: data.position, 
        direction: data.direction 
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
