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
    user.on("invite", roomInvite); // Once the user has connected, launch the addPlayer function

    function roomInvite(guest) {
    	var roomID = uniqid();
    	roomMapping[roomID] = [user];

    	console.log("playerID = " + roomID + " : " + roomMapping[roomID]);

    	// Have the user join the newly created room
    	user.join(roomID);

    	// Emit back to the user that the url has been generated
    	user.emit("generated-url", roomID);
    }
}
