const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

wss.on('connection', (ws) => {
  console.log('A user connected');

  ws.on('message', (message) => {
    const msg = JSON.parse(message);

    if (msg.type === 'chat') {
      // Broadcast regular chat message to all clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'chat', message: msg.message }));
        }
      });
    } else if (msg.type === 'file') {
      // Broadcast file content to all clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'file',
            fileName: msg.fileName,
            fileContent: msg.fileContent,
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server listening on *:3000');
});
