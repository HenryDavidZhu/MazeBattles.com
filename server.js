const colyseus = require('colyseus');
const http = require('http');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const gameServer = new colyseus.Server({server: server});

var uniqid = require("uniqid");

gameServer.register('tictactoe', require('./rooms/mazebattles'));
server.listen(port);

app.use(express.static("public"));
console.log(`Listening on ws://localhost:${ port }`);

var socket = require("socket.io");
var io = socket(server);

io.sockets.on("connection", playerConnect);

function playerConnect(user) {
    user.on("invite", roomInvite);

    // Generate an id with uniqid
    function roomInvite() {
        var roomID = uniqid();

        console.log("generated roomID = " + roomID);

        user.emit("generated-url", roomID);
    }
}