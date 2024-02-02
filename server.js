const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to store the connections along with their usernames
const clients = new Map();

wss.on('connection', (ws) => {
  // Prompt the user to enter their name
  ws.send('Please enter your name:');

  // Event listener for incoming messages
  ws.on('message', (message) => {
    if (!clients.has(ws)) {
      // Set the entered name as the username

      clients.set(ws, message);
      broadcast(`${message} has joined the chat`);
      return;
    }
    // Broadcast the message along with the username
    broadcast(`${clients.get(ws)}: ${message}`);
  });

  // Event listener for closing connections
  ws.on('close', () => {
    const username = clients.get(ws) || 'Anonymous';
    broadcast(`${username} has left the chat`);
    clients.delete(ws);
  });
});

// Function to broadcast a message to all connected clients
function broadcast(message) {

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Serve static files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
