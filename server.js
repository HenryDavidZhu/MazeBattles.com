var express = require("express");
var socket = require("socket.io");

var app = express();
var server = app.listen(3000);

app.use(express.static("public"));

var io = socket(server, {pingTimeout: 63000});

io.sockets.on("connection", playerConnect);

var usersPool = []; // An array that contains all of the users connected on the site (objects)
var usersPoolIDs = []; // An array that keeps track of all of the IDs of the users connected on the site
var userMatchings = {}; // An associative array that ties each id to a user
var userPositions = {}; // An associative array that ties each user with their current position

var links = {}; // An associative array that ties each user id to the user object is it linked up to

var roomsAndVisitedCells = {}; // An associative array that keeps track of the number of cells visited within each room
var roomsAndCurrent = {}; // An associative array that keeps track of the current cell in each room
var roomsAndSolvingPoints = {}; // An associative array that keeps track of the current cell when solving a maze
var roomsAndStacks = {}; // An associative array that keeps track of the nodes that still have yet to be visited for each room
var roomsAndQueues = {}; // An associative array that keeps track of the nodes that still have yet to be analyzed when solving each room

var linksAndMazes = {}; // An associative array that ties each room with the maze that corresponds to its corresponding maze
var clientsAndTimes = {}; // An associative array that keeps track of the time spent on solving the current maze for each client

var mazeGenerator; // Continuous call of a function that generates a maze
var deltaTime = 1000; // The interval of time in which time is measured in (seconds)

var playersOnline = 0; // The number of players currently connected to the site.

var line = 0;

var clearTimeoutsFor = []; // The list of users to remove from the system
var usersToGenerateMaze = []; // The list of users in which to generate the maze to

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

function findPlayerWithID(players, id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id == id) {
            return i;
        }
    }

    return -1;
}

function playerConnect(user) {
    user.on("user-connected", addPlayer); // Once the user has connected, launch the addPlayer function

    function addPlayer(guest) {
        /*
            The following if statement checks if the user is a valid user and if the user has already been added to the user-identification
            pool (prevents problems with duplicating a user's addition into the memory during refresh)
        */
        if (guest) {
            user.canPair = true;
            user.isPaired = false;
            user.completeGeneration = false; // Each user starts off with a new maze

            user.score = 0; // Each user starts out with 0 wins initially

            usersPool.push(user);
            usersPoolIDs.push(user.id);

            // Associative array that ties each string id to a user
            userMatchings[user.id] = user;
        }

        playersOnline += 1; // Update the number of players online

        matchUsers();
    }

    user.on("open-pairing", openPairing); // When the user has just won or lost the match

    function openPairing(placeholder) {
        console.log("user.canPair = " + user.canPair + ", user.isPaired = " + user.isPaired);

        if (!user.isPaired) {
            user.canPair = true;
        }

        // Set user.isPaired to false, and set user.canPair to true
        if (!user.isPaired && user.canPair) {
            var userIndex = usersPoolIDs.indexOf(user.id);

            user.isPaired = false;
            user.completeGeneration = false;

            if (userIndex == -1) {
                usersPool.push(user);
                usersPoolIDs.push(user.id);

                // Associative array that ties each string id to a user
                userMatchings[user.id] = user;           
            }

            matchUsers();
        }
    }

    user.on("position", updatePosition);

    function updatePosition(data) { // Endgame logic applies to both winners and losers
        var socketID = data[0];
        var currentPosition = data[1]; // This is potentially causing problems
        userPositions[socketID] = currentPosition;

        if (currentPosition.row == 15 && currentPosition.column == 19) {
            // Game has been won by current
            if (userMatchings[socketID]) { // If the player wins, add 1 to their current score
                userMatchings[socketID].score = userMatchings[socketID].score + 1;

                userMatchings[socketID].canPair = false;
                userMatchings[socketID].isPaired = false;
                userMatchings[socketID].emit("winner", [socketID, userMatchings[socketID].score]);

                if (links[userMatchings[socketID].id]) { // If the player loses, nothing happens to their score
                    links[userMatchings[socketID].id].canPair = false;
                    links[userMatchings[socketID].id].isPaired = false;
                    links[userMatchings[socketID].id].emit("winner", [socketID, links[userMatchings[socketID].id].score]);
                }
            }

            matchUsers();
        }
    }

    user.on("disconnect", disconnectUser);
    user.on("activitytimeout", disconnectUser);

    function disconnectUser(inactivity) {
        user.isPaired = false;

        if (!user.canPair && links[user.id] && !links[user.id].canPair) {
            // Find out who the disconnected user is connected to
            var disconnectedUserID = user.id;
            var pairedUserID = links[disconnectedUserID].id;

            // Stop running generateMaze for the two users
            clearTimeoutsFor.push(disconnectedUserID);
            clearTimeoutsFor.push(pairedUserID);

            // Allow the paired user to be able to be repaired
            pairedUser = userMatchings[pairedUserID];
            pairedUser.isPaired = false;
            //pairedUser.canPair = true;

            // Determine the room that the two clients are in
            var roomName = disconnectedUserID + "|||" + pairedUserID;

            if (!roomsAndStacks[roomName]) {
                roomName = pairedUserID + "|||" + disconnectedUserID;
            }

            // Emit to paired user that the opponent has disconnected
            io.to(pairedUserID).emit("disconnecting", true);

            // Disconnect clients from the room
            user.leave(roomName);
            pairedUser.leave(roomName);

            // Delete all room associations
            delete roomsAndVisitedCells[roomName];
            delete roomsAndCurrent[roomName];
            delete roomsAndSolvingPoints[roomName];
            delete roomsAndStacks[roomName];
            delete roomsAndQueues[roomName];

            // Destroy the link between the two clients
            delete links[disconnectedUserID];
            delete links[pairedUserID];

            // Remove the disconnected user from the usersPool, usersPoolIDs, userMatchings
            var index = -1;

            for (var i = 0; i < usersPool.length; i++) {
                var userToAnalyze = usersPool[i];

                if (userToAnalyze.id == disconnectedUserID) {
                    index = i;
                    break;
                }
            }

            usersPool.splice(index, 1);
            usersPoolIDs.splice(usersPoolIDs.indexOf(disconnectedUserID), 1);
            delete userMatchings[disconnectedUserID];

            // Remove the disconnected user and paired user from userPositions
            delete userPositions[disconnectedUserID];
            delete userPositions[pairedUserID];

            // Remove the link between the room and the maze
            delete linksAndMazes[roomName];

            // Remove the paired user and disconnected user from usersToGenerateMaze
            usersToGenerateMaze.splice(usersToGenerateMaze.indexOf(pairedUserID), 1);
            usersToGenerateMaze.splice(usersToGenerateMaze.indexOf(disconnectedUserID), 1);

            matchUsers();
        } else {
            user.emit("inactivity", true);
        }

        // Edge case (user canPair is true, isn't paired, and has no link)
        if (user.canPair && !user.isPaired && !links[user.id]) {
            var disconnectedUserID = user.id;
            delete userMatchings[disconnectedUserID];

            var index = -1;

            for (var i = 0; i < usersPool.length; i++) {
                var userToAnalyze = usersPool[i];

                if (userToAnalyze.id == disconnectedUserID) {
                    index = i;
                    break;
                }
            }

            usersPool.splice(index, 1);
            usersPoolIDs.splice(usersPoolIDs.indexOf(disconnectedUserID), 1);
        }
    }

    user.on("solvedPercentage", updatePercentages);

    function updatePercentages(data) {
        var socket = data[0];
        var percentage = data[1];
        console.log("percentage = " + percentage);

        if (links[socket]) {
            links[socket].emit("opponentPercentage", percentage);
        }
    }
}

function generateMaze(id) {
    if (clearTimeoutsFor.indexOf(id) > -1) {
        clearTimeout(generateMaze);
        return;
    }

    var userMatch = userMatchings[id];
    var userPair = links[userMatch.id];

    if (!userMatch.completeGeneration) {
        var roomName = userMatch.id + "|||" + userPair.id;

        if (!(roomName in linksAndMazes)) {
            roomName = userPair.id + "|||" + userMatch.id;
        }

        var linkMaze = linksAndMazes[roomName];
        var numVisited = roomsAndVisitedCells[roomName];
        // Set the maze current to its value in the associative array
        var current = roomsAndCurrent[roomName];

        if (userMatch.isPaired) {
            if (userMatch.mazeHolder == null) {
                userMatch.mazeHolder = false;
                userPair.mazeHolder = true;
            } else if (userMatch.mazeHolder) {
                var complete;

                if (numVisited < linkMaze.numCells) {
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

                    userPair.emit("complete", true);
                    userMatch.emit("complete", true);

                    userMatch.emit("completeGeneration", true);
                    userPair.emit("completeGeneration", true);

                    userMatch.completeGeneration = true;
                    userPair.completeGeneration = true;
                }
            }
            mazeGenerator = setTimeout(generateMaze, 20, id);
        }
    }
}

function matchUsers() {
    var base = -1;
    for (var i = (usersPool.length - 1); i >= 0; i--) {
        var client = usersPool[i];
        if (!client.isPaired && client.canPair) {
            if (base == -1) {
                base = i;
            } else {
                client.completeGeneration = false;
                usersPool[base].completeGeneration = false;

                client.isPaired = true;
                client.canPair = false;
                usersPool[base].isPaired = true;
                usersPool[base].canPair = false;
                var roomName = client.id + "|||" + usersPool[base].id;

                var clientID = client.id;
                var baseID = usersPool[base].id;

                client.join(roomName);
                usersPool[base].join(roomName);
                links[client.id] = usersPool[base];
                links[usersPool[base].id] = client;

                var maze = new Maze(20, 16);
                maze.createMaze();
                linksAndMazes[roomName] = maze; // This is the problem we are having
                roomsAndVisitedCells[roomName] = 1;

                var roomCurrent = maze.cellGraph[0][0];
                roomCurrent.visited = true;

                roomsAndCurrent[roomName] = roomCurrent;
                roomsAndSolvingPoints[roomName] = roomCurrent;
                roomsAndStacks[roomName] = [];
                roomsAndQueues[roomName] = [];

                var prevBase = base;
                base = -1;

                client.emit("paired", true);
                usersPool[prevBase].emit("paired", true);
                client.emit("initialMaze", maze);
                usersPool[prevBase].emit("initialMaze", maze);

                if (clearTimeoutsFor.indexOf(client.id) != -1) {
                    clearTimeoutsFor.splice(clearTimeoutsFor.indexOf(client.id), 1);
                }

                if (clearTimeoutsFor.indexOf(usersPool[prevBase].id) != -1) {
                    clearTimeoutsFor.splice(clearTimeoutsFor.indexOf(usersPool[prevBase].id), 1);
                }

                generateMaze(client.id);
                generateMaze(usersPool[prevBase].id);
            }
        }
    }
}