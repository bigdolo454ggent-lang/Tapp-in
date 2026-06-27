const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ---------------- CHAT ----------------
  socket.on("chat-message", (msg) => {
    io.emit("chat-message", msg);
  });

  // ---------------- CALL ----------------
  socket.on("call-user", ({ to, from, offer }) => {
    io.to(to).emit("incoming-call", { from, offer });
  });

  socket.on("accept-call", ({ to, answer }) => {
    io.to(to).emit("call-accepted", { answer });
  });

  socket.on("reject-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  // ---------------- ICE ----------------
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
