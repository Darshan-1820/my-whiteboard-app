const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the cors middleware

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://my-whiteboard-app-client.vercel.app", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

app.use(cors()); // Enable CORS for all routes

app.use("/", (req, res) => {
    res.send("Server is running.");
});

io.on('connection', (socket) => {
  console.log("User Online");

  socket.on('canvas-data', (data) => {
    socket.broadcast.emit('canvas-data', data);
  });

  socket.on('chat-message', (message) => {
    console.log("New message from user");
    socket.broadcast.emit('chat-message', message);
  });

  socket.on('clear-board', () => {
    io.emit('clear-board');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
server.listen(server_port, () => {
  console.log(`Started on ${server_port}`);
});

module.exports = app;
