// Setup required dependencies (npm)
var express = require("express");
var socket = require("socket.io");
var uniqid = require("uniqid");

function Maze(numRows, numColumns, cellSize) {
    // Constructs a maze given the number of rows, columns, and the size of a cell
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.numCells = numRows * numColumns;

    this.cellGraph = []; // 2-Dimensional array containing all the Cell objects inside the maze

    this.wallList = {};
    this.cellSize = cellSize;

    this.mazeWidth = this.numColumns * this.cellSize;
    this.mazeHeight = this.numRows * this.cellSize;

    for (var i = 0; i < numRows; i++) { // For every single row
        this.cellGraph.push([]); // Start out with an empty row
    }

    this.endString = (numRows - 1) + "-" + (numColumns - 1);
}

Maze.prototype.createMaze = function() {
    for (var i = 0; i < this.numRows; i++) { // Iterate through every row
        for (var j = 0; j < this.numColumns; j++) { // Iterate through every column
            var cell = new Cell(this.cellSize, i, j); // Construct a new cell
            this.cellGraph[i].push(cell); // Add that cell to the current row
        }
    }
}

function Cell(cellSize, row, column) {
    this.cellSize = cellSize; // The width and height of the cell

    this.column = column;
    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;

    this.walls = [true, true, true, true]; // 0 = top, 1 = right, 2 = bottom, 3 = left
    this.visited = false; // Whether the cell has been traversed or not
}

class System {
    // Stores the game's networking data
    constructor() {
        this.rooms = {}; // Maps room IDs to their Room objects
        this.clientMappings = {}; // Maps individual client IDs with their room IDs
    }
}

var system = new System(); // Initialize game's networking system

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static("public", {
    dotfiles: 'allow'
}));

var io = socket(server, {
    pingTimeout: 63000
});
io.sockets.on("connection", playerConnect);

class Room {
    constructor() {
        this.maze = null;
        this.playerPositions = {}; // Maps the player IDs to their position ([row, col])
        this.playerIDs = []; // List of the IDs of all the players who have joined a room
        this.maxUsers = 2; // Max number of users in a room (DO NOT change this, it should always be 2)
        this.wallList = {}; // Structure of a wall [rol (num), col (num), direction (string)]
        this.open = true; // Whether a user can join the room or not
        this.difficulty = ""; // The difficulty of the maze (easy, medium, hard, or expert)
    }

    connectUser(userID, roomID) { 
        if (this.open) { // Check if the room is open
            this.playerPositions[userID] = [0, 0]; // Every player starts out at the top left corner
            system.clientMappings[userID] = roomID; // Map the user's ID to the room ID

            if (Object.keys(this.playerPositions).length == this.maxUsers) { // If both users have joined the room
                this.playerIDs = Object.keys(this.playerPositions); // Get a list of the IDs of the room's players

                for (var i = 0; i < this.playerIDs.length; i++) {
                    io.to(this.playerIDs[i]).emit("maze", [this.maze, this.difficulty]); // Send the generated maze to the players
                    io.to(this.playerIDs[i]).emit("paired", roomID); // Tell the clients to initialize the game
                }

                this.open = false; // Close the room
            }
        }
    }
}

function playerConnect(user) {
    user.on("invite", createRoom); 

    function createRoom(generatedMaze) {
        var roomID = uniqid(); // Generate a unique id
        system.rooms[roomID] = new Room(); // Create the new room
        system.rooms[roomID].connectUser(user.id, roomID); // Connect the user to the room
        system.rooms[roomID].maze = generatedMaze[0]; // Download the maze generated client-side
        system.rooms[roomID].difficulty = generatedMaze[1]; // Set the difficulty

        user.emit("generated-url", roomID);
    }

    user.on("join", joinRoom);

    function joinRoom(roomID) {
        if (system.rooms[roomID] && system.rooms[roomID].open) { // See if the room exists AND if it is open
            system.rooms[roomID].connectUser(user.id, roomID); // Connect the user to the room
        } else {
            user.emit("invalid", true); // The user has submitted a non-existent code
        }
    }

    user.on("winner", processWinner);

    function processWinner(roomID) {
        var room = system.rooms[roomID]; // Find the room the winner is in
        var loser = room.playerIDs[0];

        if (loser == user.id) { // if this condition is satisfied, it means room.plaeyrIDs[0] is the winner
            loser = room.playerIDs[1];
        }

        io.to(loser).emit("lost", true); // Emit to the loser that he lost the match
    }

    user.on("disconnect", disconnectedUser);

    function disconnectedUser() {
        if (system.clientMappings[user.id]) { // See if the room still exists
            var roomID = system.clientMappings[user.id];

            // Figure out the opponent
            var opponent = system.rooms[roomID].playerIDs[0];
            if (opponent == user.id) {
                opponent = system.rooms[roomID].playerIDs[1];
            }

            io.to(opponent).emit("disconnectedUser", true); // Tell the user that the opponent disconnected from the match

            // Destroy the room and references between the client IDs and the room IDs
            delete system.clientMappings[user.id];
            delete system.clientMappings[opponent];
            delete system.rooms[roomID];
        }
    }

    user.on("rematch", sendRematchRequest);

    function sendRematchRequest(roomID) {
        var room = system.rooms[roomID]; // Figure out the room the user is in

        // Determine the winner of the match
        var winner = room.playerIDs[0];
        if (winner == user.id) {
            winner = room.playerIDs[1];
        }

        io.to(winner).emit("rematchrequest", true); // Tell the winner that the opponent has requested a rematch
    }

    user.on("acceptRematch", acceptRematchHandler);

    function acceptRematchHandler(maze, roomID) { // If the user accepts the rematch
        var room = system.rooms[roomID]; // Figure out the room the user is in

        // Have the room download the maze
        room.maze = new Maze(maze.numRows, maze.numColumns); 
        room.maze.cellGraph = maze.cellGraph;

        for (var i = 0; i < room.playerIDs.length; i++) {
            io.to(room.playerIDs[i]).emit("maze", [room.maze, room.difficulty]); // Send the generated maze to the players
            io.to(room.playerIDs[i]).emit("paired", roomID); // Tell the clients to intialize the game

            room.playerPositions[i] = [0, 0]; // reset the player position
        }
    }
}