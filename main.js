// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Allow cross-origin requests from your client domain (adjust as needed)
app.use(cors({
  origin: 'https://code.addmask.com', // Replace with your actual client domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Store player data (if needed)
let players = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // When a player sends movement data, broadcast it to others
  socket.on('player-movement', (data) => {
    players[socket.id] = data.position; // Optionally store it
    // Broadcast to everyone except the sender
    socket.broadcast.emit('playerMoved', { id: socket.id, movementData: data.position });
  });
  
  // When a player shoots, broadcast that event
  socket.on('shoot', (data) => {
    socket.broadcast.emit('playerShot', { id: socket.id, position: data.position, direction: data.direction });
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
