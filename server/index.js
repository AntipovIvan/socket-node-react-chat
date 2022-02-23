const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

// Start server at port
const PORT = process.env.PORT || 5000;

// Import router.js
const router = require("./router");

// Create server
const app = express();
// Server using router.js and CORS
app.use(router);
app.use(cors());

const server = http.createServer(app);

const io = socketio(server);

// Create connection (join)
io.on("connection", (socket) => {
  console.log("We have a new connection");

  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room${user.room}`,
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });
    socket.join(user.room);
    // Error handling
    // const error = true;
    // if (error) {
    //   callback({ error: "error" });
    // }
    callback();
  });

  socket.on("sendMesage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  //   Stop connection (leave)
  socket.on("disconnect", () => {
    console.log("User has left");
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
