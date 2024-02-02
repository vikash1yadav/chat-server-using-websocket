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
  // ws.send('Please enter your name:');
  // const msg = JSON.parse(message);

  ws.send(JSON.stringify({type: 'auth',
  statusCode: 499,
   data: {
    message: 'Please enter your name:'
  }}));

  // Event listener for incoming messages
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (!clients.has(ws)) {
      // Set the entered name as the username
      if (msg?.type=='auth') {
        clients.set(ws, msg?.data?.username);
        broadcast(ws, 
          JSON.stringify({type:'notification', data:{message:`${msg?.data?.username} has joined the chat`}})
          );
        return; 
      }
    }
    // Broadcast the message along with the username
    if (msg?.type=='chat') {
      broadcast(ws, 
        JSON.stringify({
          type: 'chat', data: {
            message: `${clients.get(ws)}: ${msg?.data?.message}`,
            username: clients.get(ws)
          }
        })
        );      
    }

    if (msg.type === 'file') {
      broadcast(ws, JSON.stringify({
        type: 'file',
        fileName: msg.fileName,
        fileContent: msg.fileContent,
      }))
    }

  });

  // Event listener for closing connections
  ws.on('close', () => {
    const username = clients.get(ws) || 'Anonymous';
    broadcast(ws, `${username} has left the chat`);
    clients.delete(ws);
  });
});

// Function to broadcast a message to all connected clients
function broadcast(ws, message) {

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
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
