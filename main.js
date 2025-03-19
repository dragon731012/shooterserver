// Import required libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io for real-time communication
const io = socketIo(server);

// CORS configuration to allow the client from a different domain
app.use(cors({
  origin: 'https://code.addmask.com',  // Replace with your actual client domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Serve static files (e.g., HTML, CSS, JS) if you want to use a public folder
app.use(express.static('public'));

// Array to store connected players (this is just for demonstration purposes)
let players = [];

// When a player connects to the server
io.on('connection', (socket) => {
  console.log('A player connected: ' + socket.id);

  // Add player to the players array
  players.push(socket.id);

  // Emit the list of players to all connected clients
  io.emit('updatePlayers', players);

  // Handle player movement
  socket.on('move', (data) => {
    console.log(`Player ${socket.id} moved: `, data);
    // Broadcast player movement to other clients
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      movementData: data,
    });
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected: ' + socket.id);

    // Remove player from the array
    players = players.filter(player => player !== socket.id);

    // Emit the updated player list to all clients
    io.emit('updatePlayers', players);
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running');
});
