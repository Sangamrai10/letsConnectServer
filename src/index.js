const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Keep track of users per room
const rooms = {}; // { roomName: Set(socketId) }

io.on("connection", (socket) => {
  console.log(`connected: ${socket.id}`);

  // Join a room
  socket.on("join_room", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = new Set();
    rooms[room].add(socket.id);
    console.log(`${socket.id} joined room ${room}`);
  });

  // Leave room on disconnect
  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (rooms[room]) rooms[room].delete(socket.id);
    }
    console.log(`disconnected: ${socket.id}`);
  });

  // Listen for messages
  socket.on("send_message", (data) => {
    // Broadcast to all sockets in the same room except sender
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("simulate_bot", ({ room, botUser, text }) => {
    const botMessage = {
      id: Date.now(),
      sender: botUser,
      text,
      room,
      timestamp: Date.now(),
    };
    // Broadcast to ALL clients in the room, including the one who triggered it
    io.to(room).emit("receive_message", botMessage);
  });
});



server.listen(port, () => {
  console.log(`server running on port ${port}`);
});
