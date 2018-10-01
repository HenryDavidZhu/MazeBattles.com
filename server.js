var express = require("express");
var socket = require("socket.io");

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

var io = socket(server);

io.sockets.on("connection", playerConnect);

var roomMapping = {}; // Mapping of roomID to list of users within that room

var uniqid = require('uniqid'); // Initialize the unique id generator

// For each room, keep track of the number of cells visited (determines when generation of maze is complete)
var roomsAndNumCellsVisited = {};

function Maze(widthCells, heightCells) {
    this.widthCells = widthCells;
    this.heightCells = heightCells;

    this.numCells = widthCells * heightCells;

    this.cellGraph = []; // 2-Dimensioanl Array that stores all the cells in the maze

    for (var i = 0; i < heightCells; i++) { // Iterate through each row in the array
        this.cellGraph.push([]); // Add a new empty row to the array
    }
}

function Cell(cellSize, row, column) {
    this.cellSize = cellSize;
    this.column = column;

    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;

    this.walls = [true, true, true, true]; // bottom, left, top, right

    this.visited = false; // Has the cell been visited by the maze generator
    this.marked = false; // Has the cell been visited by the maze solver
}

Cell.prototype.getNumWalls = function() {
    // Function that gets the number of walls surrounding the cell

    var numWalls = 0;

    for (var i = 0; i < this.walls.length; i++) { // Iterate through each wall
        if (this.walls[i]) { // Check if a wall is present
            numWalls += 1;
        }
    }

    return numWalls;
}

Maze.prototype.getNeighbor = function(dfs, cellRow, cellColumn) { // Get all of the neighbors of a specific cell in the maze
    var neighbors = []; // The list of all the neighbors of that cell
    var coordinates = []; // The list of the coordinates of the neighbors of that cell

    if (cellColumn > 0) { // If the cell isn't on the left side, there is a neighbor to the left
        var neighbor = this.cellGraph[cellRow][cellColumn - 1]; // Get the neighboring cell to the left

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow, cellColumn - 1]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWall(this, neighbor)) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellColumn < this.widthCells - 1) { // If the cell isn't on the right side, there is a neighbor to the right
        var neighbor = this.cellGraph[cellRow][cellColumn + 1]; // Get the neighboring cell to the right

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow, cellColumn + 1]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWall(this, neighbor)) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellRow > 0) { // If the cell isn't on the top side, there is a neighbor to the top
        var neighbor = this.cellGraph[cellRow - 1][cellColumn]; // Get the neighboring cell to the top

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow - 1, cellColumn]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWall(this, neighbor)) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellRow < this.heightCells - 1) { // If the cell isn't on the bottom side, there is a neighbor to the bottom
        var neighbor = this.cellGraph[cellRow + 1][cellColumn]; // Get the neighboring cell to the bottom

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow + 1, cellColumn]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWall(this, neighbor)) {
                neighbors.push(neighbor);
            }
        }
    }

    if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
        if (neighbors.length > 0) { // Make sure that their is a neighbor to draw from
            var randomIndex = Math.floor(Math.random() * neighbors.length);
            var randomNeighbor = neighbors[randomIndex]; // Get a random neighbor
            return randomNeighbor;
        } else {
            return undefined;
        }
    } else { // If dfs is set to false, return all the neighbors
        return neighbors;
    }
}

function deleteWall(current, neighbor) { // Delete the wall between two cells
    var deltaX = current.column - neighbor.column; // Get the x distance between the two cells
    var deltaY = current.row - neighbor.row; // Get the y distance between the two cells

    if (deltaX == 1) { // Current is to the right of the neighbor
        current.walls[3] = false;
        neighbor.walls[1] = false;
    }
    if (deltaX == -1) { // Current is to the left of the neighbor
        current.walls[1] = false;
        neighbor.walls[3] = false;
    }
    if (deltaY == 1) { // Current is to the bottom of the neighbor
        current.walls[0] = false;
        neighbor.walls[2] = false;
    }
    if (deltaY == -1) { // Current is to the top of the neighbor
        current.walls[2] = false;
        neighbor.walls[0] = false;
    }
}

function equalCells(cell1, cell2) {
    return cell1.row == cell2.row && cell1.column == cell2.column;
}

function isWall(cellA, cellB) {
    // Whether there's a wall or not depends on the orientation of the blocks
    // If it's vertical, it has to be false between even numbers
    // If it's horizontal, it has to be false between odd numbers
    for (var j = 0; j < cellA.walls.length; j++) {
        for (var k = 0; k < cellB.walls.length; k++) {
            if (Math.abs(j - k) == 2 && !cellA.walls[j] && !cellB.walls[k]) {
                var rA = cellA.row;
                var cA = cellA.column;
                var rB = cellB.row;
                var cB = cellB.column
                if ((rA - rB) == 1 && j == 0 || (rA - rB) == -1 && j == 2 || (cA - cB) == 1 && j == 3 || (cA - cB) == -1 && j == 1) {
                    return false;
                }
            }
        }
    }
    return true;
}

Maze.prototype.createMaze = function() {
    for (var i = 0; i < this.heightCells; i++) {
        for (var j = 0; j < this.widthCells; j++) {
            var cell = new Cell(25, i, j);
            this.cellGraph[i].push(cell);
        }
    }
}

var initialMaze = new Maze(20, 16);

function generateMaze(roomID) {
    var numVisited = roomsAndNumCellsVisited[roomName] // Get the number of cells viisted in that room

    if (numVisited < roomMapping[roomID][2].numCells) {
        var cellRow = current.row;
        var cellColumn = current.column;
        var neighbor = linkMaze.getNeighbor(true, cellRow, cellColumn);

        if (neighbor && !neighbor.visited) {
            roomsAndStacks[roomName].push(current);
            deleteWall(neighbor, current);

            if (neighbor.getNumWalls() < 4) {
                neighbor.visited = true;
            }

            userPair.emit("modifyCell", current);
            userMatch.emit("modifyCell", current);
            line += 1;

            if (neighbor) {
                userPair.emit("modifyCell", neighbor);
                userMatch.emit("modifyCell", neighbor);
            }

            current = neighbor;
            numVisited += 1;
        } else if (roomsAndStacks[roomName].length > 0) {
            current = roomsAndStacks[roomName].pop();
        }

        complete = false;
        roomsAndVisitedCells[roomName] = numVisited;
        roomsAndCurrent[roomName] = current;
        linksAndMazes[roomName] = linkMaze;
    } else {
        complete = true;

        io.sockets.in(roomID).emit("complete", true);

        io.sockets.in(roomID).emit("completeGeneration", true);

        //userMatch.completeGeneration = true;
        //userPair.completeGeneration = true;
    }
}

function playerConnect(user) {
    user.on("invite", roomInvite); // Once the user has connected, launch the addPlayer function

    function roomInvite() {
        var roomID = uniqid();
        roomMapping[roomID] = [user];

        console.log("playerID = " + roomID + " : " + roomMapping[roomID]);

        // Have the user join the newly created room
        user.join(roomID);

        // Initialize the number of cells visited in the new room to 0
        roomsAndNumCellsVisited[roomID] = 0;

        // Emit back to the user that the url has been generated
        user.emit("generated-url", roomID);
    }

    user.on("room-code", checkRoomCode);

    function checkRoomCode(roomCode) {
        // If the dictionary entry is null, it means that code is invalid
        console.log("roomCode = " + roomCode);

        if (!roomMapping[roomCode]) {
            console.log("false code validity: roomMapping[" + roomCode + "] = " + roomMapping[roomCode]);
            user.emit("code-validity", false);
        } else {
            user.emit("code-validity", true);

            var validToJoin = false;

            console.log("roomMapping[" + roomCode + "] = " + roomMapping[roomCode]);
            console.log("roomMapping[" + roomCode + "].length = " + roomMapping[roomCode].length);

            // Secondary validation: Ensure that the room has 1 user in it 
            // Do this in two ways:
            // (1) if the length of the array is 1, there can only be 1 user in the room
            // (2) if the length of the array is 2, but 1 of the elements is a maze, there can 
            // only be 1 user in that room
            if (roomMapping[roomCode].length == 1) {
                console.log("emitting paired function to room");
                user.join(roomCode); // Connect the user to the room
                // Emit to the users that they have been paired
                io.sockets.in(roomCode).emit("paired", true);
            }

            if (roomMapping[roomCode].length == 2) {
                if (roomMapping[0].cellGraph || roomMapping[1].cellGraph) {
                    user.join(roomCode); // Connect the user to the room
                    // Emit to the users that they have been paired
                    io.sockets.in(roomCode).emit("paired", true);
                }
            }

            // Print out the users in that room

            // Add the maze as the third element to the array
            roomMapping[roomCode].push(initialMaze);

            // Emit to the user that the initial maze has been generated
            io.to(roomCode).emit("initial-maze", initialMaze);

            // Begin generation process
        }
    }
}
