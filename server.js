const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  require("express-session")({
    saveUninitialized: false,
    resave: true,
    secret: 'sessi1991$',
  })
)


app.get("/login", function (req, res, next) {
  if (req.session.user) {
    res.redirect("/");
  }
  res.render("login");
});

app.post("/login", function (req, res, next) {
  req.session.user = '1';
  return res.status(200).json({ message: "Student login sucessfull" });
});

app.get("/logout", function (req, res, next) {
  delete req.session.user;
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  }
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
});
server.listen(3000)