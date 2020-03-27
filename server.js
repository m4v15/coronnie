const express = require("express");
const http = require("http");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "client", "dist")));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", function(req, res) {
  console.log(req);
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const server = http.createServer(app);
const io = require("socket.io")(server);

const dealer = require("./dealer.js");

let players = [];

io.on("connection", function(socket) {
  console.log("A user connected: " + socket.id);
  console.log("Name: " + socket.handshake.query.name);

  socket.on("dealCards", function(roundNumber) {
    const dealtCards = dealer.deal(roundNumber, players.length);
    players.forEach(player => {
      const hand = dealtCards.playerCards.shift();
      io.to(`${player.id}`).emit("dealCards", hand);
    });
    io.emit("trumps", dealtCards.trumps);
  });

  socket.on("newPlayer", function(player) {
    console.log("new player!");
    console.log(player.name + " joined");
    players.push(player);
    io.emit("players", players);
  });

  socket.on("cardPlayed", function(gameObject, playerId) {
    io.emit("cardPlayed", gameObject, playerId);
  });

  //   socket.on("changeCard", function(sprite) {
  //     socket.broadcast.emit("changeCard", sprite);
  //   });

  socket.on("claimTrick", function(winner) {
    players = players.map(player => {
      return player.id === winner.id ? winner : player;
    });
    io.emit("trickClaimed");
    io.emit("players", players);
  });

  socket.on("redeal", function() {
    players = players.map(player => {
      return { ...player, tricks: 0 };
    });
    io.emit("redeal");
    io.emit("players", players);
  });

  socket.on("disconnect", function() {
    console.log("A user disconnected: " + socket.id);
    players = players.filter(player => player.id !== socket.id);
  });
});

server.listen(3003, function() {
  console.log("Server started!");
});
