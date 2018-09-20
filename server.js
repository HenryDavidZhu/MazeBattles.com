var express = require("express");
var socket = require("socket.io");

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

var io = socket(server);

io.sockets.on("connection", playerConnect);

var roomMapping = {}; // Mapping of roomID to list of users withint hat room

var uniqid = require('uniqid'); // Initialize the unique id generator

function playerConnect(user) {
    user.on("joining-room", joinRoom); // Once the user has connected, launch the addPlayer function

    function joinRoom(guest) {
    	var playerID = uniqid();
    	roomMapping[playerID] = [guest];

    	console.log("playerID = " + playerID + " : " + roomMapping[playerID]);
    }
}
