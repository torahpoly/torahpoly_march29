// Minimal Socket.IO server for TorahPoly
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let gameState = {
  players: [],
  currentPlayerIndex: 0,
  tzedakahAmount: 0,
  zchutFundAmount: 0,
  // Add other shared state as needed
};


io.on('connection', (socket) => {
  // Send current state to new client
  socket.emit('state', gameState);

  // Handle player join
  socket.on('join', (player) => {
    // Prevent duplicate players by name
    if (!gameState.players.some(p => p.name === player.name)) {
      gameState.players.push(player);
    }
    // Broadcast to all clients (including the new one)
    io.emit('state', gameState);
    // Also send the latest state directly to the new client (in case of race conditions)
    socket.emit('state', gameState);
  });

  // Handle state updates
  socket.on('updateState', (newState) => {
    gameState = { ...gameState, ...newState };
    io.emit('state', gameState);
  });

  // Handle getState event (client requests latest state)
  socket.on('getState', () => {
    socket.emit('state', gameState);
  });

  // Handle disconnect (optional: remove player)
  socket.on('disconnect', () => {
    // Optionally handle player removal
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});