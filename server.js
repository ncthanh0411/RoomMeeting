const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId)
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('screenplay', (stream) => {
    socket.broadcast.emit('screenplay', stream);
  })

  socket.on('screenoff', () => {
    socket.broadcast.emit('screenoff');
  })

  socket.on('initiate', () => {
    io.emit('initiate');
  });

  socket.on('stopshare', () => {
    io.emit('stopshare');
  });
});
server.listen(3000)