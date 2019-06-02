// CUSTOM DATA STRUCTURE: BIDIRECITONAL MAP


// The indexes of the directions and vectors arrays correspond to each other
var directions = ["N", "E", "S", "W"];

var vectors = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

function isWall(cellA, cellB) {
    // Whether there's a wall between two cells
    // 0 = top, 1 = right, 2 = bottom, 3 = left
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

function Maze(numRows, numColumns, cellSize) {
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.numCells = numRows * numColumns;
    this.cellGraph = [];
    this.wallList = {};
    this.cellSize = cellSize;

    this.mazeWidth = numColumns * cellSize;
    this.mazeHeight = numRows * cellSize;

    for (var i = 0; i < numRows; i++) { // For every single row
        this.cellGraph.push([]); // Start out with an empty row
    }

    this.endString = (numRows - 1) + "-" + (numColumns - 1);
}
/*Maze.prototype.getRandomPos = function() {
    return [Math.floor(Math.random() * this.numRows), Math.floor(Math.random() * this.numColumns)];
}*/

Maze.prototype.createMaze = function () { // Build an empty maze
    for (var i = 0; i < this.numRows; i++) { // Iterate through every row
        for (var j = 0; j < this.numColumns; j++) { // Iterate through every column
            var cell = new Cell(15, i, j); // Create a new size at row i and column j with size 20
            this.cellGraph[i].push(cell); // Add the cell to the row
        }
    }
}

Maze.prototype.calculateCellDivision = function(wall) {
    // Calculate the two cells that the wall divides
    // For example:
    // If the wall is [10, 11, "N"]
    // The two cells that the wall divides are (10, 11) and (9, 11)

    var row = wall[0];
    var col = wall[1];

    var cell1 = this.cellGraph[row][col]; // Get the cell of the wall

    // Get the corresponding vector based upon the direction of the wall
    var vectorIndex = directions.indexOf(wall[2]);

    // Add the vector to the position of cell1
    var cell2Row = parseInt(cell1.row) + vectors[vectorIndex][0];
    var cell2Column = parseInt(cell1.column) + vectors[vectorIndex][1];

    if (cell2Row < 0 || cell2Row >= this.cellGraph.length ||
        cell2Column < 0 || cell2 >= this.cellGraph[0].length) {
        return -1;
    }

    var cell2 = this.cellGraph[cell2Row][cell2Column]; // Get the corresponding cell

    var cellsVisited = 0;
    var unvisitedCell;

    if (cell1.visited) {
        cellsVisited += 1;
        unvisitedCell = cell2;
    }

    if (!cell2) { // This means that the wall is a border wall
        return -1;
    }

    if (cell2.visited) {
        cellsVisited += 1;
        unvisitedCell = cell1;
    }

    if (cellsVisited == 1) {
        return [cell1, cell2, cellsVisited, unvisitedCell];
    }

    return -1;
}

Maze.prototype.deleteWall = function(current, neighbor) {
    var deltaX = current.column - neighbor.column;
    var deltaY = current.row - neighbor.row;

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

Maze.prototype.getRandomPos = function() {
    return [Math.floor(Math.random() * this.numRows), Math.floor(Math.random() * this.numColumns)];
}

Maze.prototype.computeFrontierWalls = function (cellRow, cellColumn) {
    /*
        The frontier walls of a cell is defined as all the walls of the adjacent cells
    */

    /*
    Coordinates of adjacent cells:
    Up [cellRow - 1, cellColumn]
    Down [cellRow + 1, cellColumn]
    Right [cellRow, cellColumn + 1]
    Left [cellRow, cellColumn - 1]
    */
    var coordinates = [
        [cellRow - 1, cellColumn],
        [cellRow + 1, cellColumn],
        [cellRow, cellColumn + 1],
        [cellRow, cellColumn - 1]
    ];

    var computedFrontier = []; // List of frontier cells

    var originalCell = this.cellGraph[cellRow][cellColumn]; // We want to calculate the frontier of the original cell

    for (var i = 0; i < coordinates.length; i++) {
        // Get the coordinates of the adjacent cell
        var coordinate = coordinates[i];
        var row = coordinate[0];
        var col = coordinate[1];

        // See if a cell exists at that area 
        // If there is a cell that exists, add all of the walls of the cell to the computedFrontier array
        if (row >= 0 && row < this.cellGraph.length && col >= 0 && col < this.cellGraph[0].length) {
            var cell = this.cellGraph[parseInt(row)][parseInt(col)];

            for (var j = 0; j < directions.length; j++) {
                computedFrontier.push([cell.row, cell.column, directions[j]]);
            }
        }
    }

    return computedFrontier;
}

Maze.prototype.generateMaze = function() {
    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
    var pos = this.getRandomPos();

    var row = pos[0];
    var column = pos[1];

    this.cellGraph[row][column].visited = true;

    for (var k = 0; k < directions.length; k++) {
        var key = row.toString() + column.toString() + directions[k].toString();

        if (!this.wallList[key]) {
            this.wallList[key] = [row, column, directions[k]];
        }
    }

    while (Object.keys(this.wallList).length > 0) { // While there are still walls in the list
        // Pick a random wall of the list
        var wallListKeys = Object.keys(this.wallList);

        var randomKey = wallListKeys[Math.floor(Math.random() * wallListKeys.length)];

        var randomWall = this.wallList[randomKey];

        var components = this.calculateCellDivision(randomWall);

        if (components != -1) {

            var numVisited = components[2];

            var cell1 = components[0];
            var cell2 = components[1];

            // If only one of the two cells that the wall divides is visited, then:
            //  1. Make the wall a passage and mark the unvisited cell as part of the maze.
            //  2. Add the neighboring walls of the cell to the wall list.
            //     Remove the wall from the list.
            if (numVisited == 1) {
                this.deleteWall(cell1, cell2);

                var unvisitedCell = this.cellGraph[components[3].row][components[3].column];
                unvisitedCell.visited = true;

                var unvisitedString = unvisitedCell.row + "|" + unvisitedCell.column;

                // Add the neighboring walls of the cell to the wall list
                // Format of the walls (by index):
                // 0 = top, 1 = right, 2 = bottom, 3 = left
                var computedFrontierWalls = this.computeFrontierWalls(unvisitedCell.row, unvisitedCell.column);

                for (var k = 0; k < computedFrontierWalls.length; k++) {
                    var computedWall = computedFrontierWalls[k];
                    var keyString = computedWall[0].toString() + computedWall[1].toString() + computedWall[2];

                    if (!this.wallList[keyString]) {
                        this.wallList[keyString] = computedWall;
                    }
                }

                // Calculate the corresponding cell
                var direction = randomWall[2];
                var directionIndex = directions.indexOf(direction);
                var oppositeDirectionIndex = -1;

                if (directionIndex == 0) {
                    oppositeDirectionIndex = 2;
                }
                if (directionIndex == 2) {
                    oppositeDirectionIndex = 0;
                }
                if (directionIndex == 1) {
                    oppositeDirectionIndex = 3;
                }
                if (directionIndex == 3) {
                    oppositeDirectionIndex = 1;
                }

                var vector = vectors[directionIndex];

                var correspondingString = (randomWall[0] + vector[0]).toString() + (randomWall[1] + vector[1]).toString() + directions[oppositeDirectionIndex];
            }
        }

        delete this.wallList[randomKey];
        delete this.wallList[correspondingString];
    }
}
//------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------
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
    constructor() {
        this.rooms = {};
        this.clientMappings = {};
    }
}


var system = new System();


var express = require("express");
var socket = require("socket.io");
var uniqid = require("uniqid");

var app = express();
var server = app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.use(express.static("public", {
    dotfiles: 'allow'
}));

var io = socket(server, {
    pingTimeout: 63000
});
io.sockets.on("connection", playerConnect);

//----------------------------------------------------------------------------------------------------------
class GenericObject {
    constructor() {
        this.attribute = 3;
    }
}
//----------------------------------------------------------------------------------------------------------

class Room {
    constructor() {
        this.maze = null;
        this.playerPositions = {};
        this.playerIDs = [];
        this.maxUsers = 2;
        this.wallList = {}; // Structure of a wall [rol (num), col (num), direction (string)]
        this.open = true;
        this.difficulty = "";
    }

    connectUser(userID, roomID) {
        if (this.open) {
            this.playerPositions[userID] = [0, 0];
            system.clientMappings[userID] = roomID;

            if (Object.keys(this.playerPositions).length == this.maxUsers) {
                this.playerIDs = Object.keys(this.playerPositions);

                for (var i = 0; i < this.playerIDs.length; i++) {
                    console.log("this.maze = " + this.maze);
                    io.to(this.playerIDs[i]).emit("maze", [this.maze, this.difficulty]);
                    io.to(this.playerIDs[i]).emit("paired", roomID, false);
                }

                this.open = false;
            }
        }
    }
}


function playerConnect(user) {
    user.on("invite", createRoom);

    function createRoom(generatedMaze) {
        var roomID = uniqid();
        system.rooms[roomID] = new Room();
        system.rooms[roomID].connectUser(user.id, roomID); // YAAASSS
        system.rooms[roomID].maze = generatedMaze[0];
        system.rooms[roomID].difficulty = generatedMaze[1];

        user.emit("generated-url", roomID);
    }

    user.on("join", joinRoom);

    function joinRoom(roomID) {
        if (system.rooms[roomID] && system.rooms[roomID].open) {
            system.rooms[roomID].connectUser(user.id, roomID);
        } else {
            user.emit("invalid", true);
        }
    }

    user.on("winner", processWinner);

    function processWinner(roomID) {
        /*
            1. Figure out who the other user is
            2. Emit to that user that they have lost
            3. Offer a rematch
            4. If the user rejects
                5. Redirect the user to the main page
                6. Redirect the winner to the main page after alerting him or her that the user has declined the rematch
                7. Completely destroy that room
            8. If the user accepts
                9. Have the accepting user create the maze, send it to the server
                10. Server emits maze to players
        */
        console.log("winner event");


        var room = system.rooms[roomID];

        console.log("room.playerIds[1] = " + room.playerIDs[1]);

        var loser = room.playerIDs[0];

        if (loser == user.id) {
            loser = room.playerIDs[1];
        }

        io.to(loser).emit("lost", true);

    }

    user.on("disconnect", disconnectedUser);

    function disconnectedUser() {
        if (system.clientMappings[user.id]) {
            console.log("user disconnected");
            // Figure out the opponent of the user
            var roomID = system.clientMappings[user.id];

            var opponent = system.rooms[roomID].playerIDs[0];

            if (opponent == user.id) {
                opponent = system.rooms[roomID].playerIDs[1];
            }

            console.log("opponent = " + opponent);
            io.to(opponent).emit("disconnectedUser", true);

            // Destroy the room and references between the client ids and the room ids
            delete system.clientMappings[user.id];
            delete system.clientMappings[opponent];
            delete system.rooms[roomID];
        }
    }

    user.on("rematch", sendRematchRequest);

    function sendRematchRequest(roomID) {
        var room = system.rooms[roomID];

        var winner = room.playerIDs[0];

        if (winner == user.id) {
            winner = room.playerIDs[1];
        }

        io.to(winner).emit("rematchrequest", true);
    }

    user.on("acceptRematch", acceptRematchHandler);

    function acceptRematchHandler(maze, roomID) {
        // If the user accepts the rematch
        var room = system.rooms[roomID];
        room.maze = new Maze(maze.numRows, maze.numColumns);
        room.maze.cellGraph = maze.cellGraph;

        for (var i = 0; i < room.playerIDs.length; i++) {
            io.to(room.playerIDs[i]).emit("maze", [room.maze, room.difficulty]);
            io.to(room.playerIDs[i]).emit("paired", roomID, true);

            room.playerIDs[i] = [0, 0]; // reset the player position in the dictionary
        }
    }
}