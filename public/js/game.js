


// MODULIZE DRAW FUNCTION FOR SINGLE-PLAYER

var roomID = "";

var gameOver = false;
var gameOverTrigger = false;

var solved = false;

var singlePlayerComplete = false;
var singlePlayerPath = ["0-0"];
var singlePlayerSolved = false;
var maze;
var singlePlayerCurrent;
var singlePlayerTimeElapsedFadeIn = false;

var timer = new Timer();

// The directions and vectors arrays correspond to each other
// For example, the first element of directions is "N" and the first element of vectors also represents a 
// north vector
var directions = ["N", "E", "S", "W"];

var vectors = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

var wallList = {}; // Structure of a wall [rol (num), col (num), direction (string)]

var locked = false;

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

function Maze(numRows, numColumns) {
    /*
        Defines a maze given the number of rows and the number of columns in the maze
    */
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.numCells = numRows * numColumns;
    this.cellGraph = [];

    for (var i = 0; i < numRows; i++) { // For every single row
        this.cellGraph.push([]); // Start out with an empty row
    }
}

Maze.prototype.createMaze = function () { // Build an empty maze
    for (var i = 0; i < this.numRows; i++) { // Iterate through every row
        for (var j = 0; j < this.numColumns; j++) { // Iterate through every column
            var cell = new Cell(20, i, j); // Create a new size at row i and column j with size 20
            this.cellGraph[i].push(cell); // Add the cell to the row
        }
    }
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

function Cell(cellSize, row, column) {
    this.cellSize = cellSize; // The width and height of the cell

    this.column = column;
    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;


    this.walls = [true, true, true, true]; // 0 = top, 1 = right, 2 = bottom, 3 = left
    this.visited = false; // Whether the cell has been traversed or not
}

var maze;

var current; // The user's current position

var complete = false;
var myp25;
var userPosition;

// The user's position
var userX = 0;
var userY = 0;

var path = [];

var mode;

$("#content").fadeIn();




    function updateTime() {
        if (singlePlayerComplete) {
            $("#game-panel").html("time elapsed: " + timer.getTimeValues().toString(["minutes", "seconds"]));
        }
    }





function initSinglePlayer() {
    // Regenerate maze
    // If win, ask to play again
    // If no, redirect back to main page
    // If yes, regenerate maze again
    mode = "single-player";

    maze = new Maze(23, 35);
    maze.createMaze();
                singlePlayerComplete = false;

            maze = generateMaze(maze);

            singlePlayerComplete = true;

    singlePlayerCurrent = maze.cellGraph[0][0];

    $("#canvas-wrapper").hide();
    $("#canvas2-wrapper").show();
    myp25 = new p5(mazeDisplay, "canvas2-wrapper");

    // Fade out the one-on-one and single-player buttons, fade in generating maze
    $("#text-container").removeClass();
    $("#text-container").addClass("animated fadeOutLeft");
    $("#text-container").hide();
}

var url = new URL(window.location.href);
var urlMode = url.searchParams.get("mode");


$("#single-player").click(function () {
    initSinglePlayer();
});

$("#one-on-one").click(function () {
    mode = "one-on-one";

    // Display the new One-on-One layout
    // Two buttons: Joining a match and Inviting others to the match
    // Fade out play-wrapper, and fade in the one-on-one-wrapper
    $("#play-wrapper").addClass("animated fadeOutLeft");

    // Make the one-on-one-wrapper visible
    $("#play-wrapper").hide();
    $("#one-on-one-wrapper").show();

    $("#one-on-one-wrapper").addClass("animated fadeInRight");

    $("#invite").click(function () {
        $("#one-on-one-wrapper").removeClass();
        $("#one-on-one-wrapper").addClass("animated fadeOutLeft");

        // Make the invite sub menu visible
        $("#text-container").hide();
        $("#invite-menu").show();
        $("#invite-menu").addClass("animated fadeInRight");

        var roomMaze = new Maze(23, 35);
        roomMaze.createMaze();
        roomMaze = generateMaze(roomMaze);

        socket.emit("invite", roomMaze);
    });

    $("#join").click(function () {
        $("#one-on-one-wrapper").hide();

        $("#one-on-one-wrapper").removeClass();
        $("#one-on-one-wrapper").addClass("animated fadeOutLeft");

        $("#join-menu").show();
        $("#join-menu").addClass("animated fadeInRight");

        var roomCode = document.getElementById("room-code");

        roomCode.addEventListener("keyup", function (event) {
            event.preventDefault();

            if (event.keyCode === 13) { // The user pressed the enter / return key
                // Begin verification process
                // Step 1: first see if the input is empty or not
                var codeLength = $("#room-code").val().length;

                if (codeLength == 0) {
                    // change to modal later
                    alert("Please enter a code.");
                } else {
                    //try {
                    roomID = $("#room-code").val();
                    socket.emit("join", roomID);
                }
            }
        });
    });
});


socket.on("lost", lostMatch);

function lostMatch() {
    locked = true;
    singlePlayerComplete = false;

    $("#game-panel").fadeOut(500, function () {
        // Change the html of the score-panel to the play again button
        $("#game-panel").html("You lost the match. Would you like to request a rematch?");

        $("#game-panel").fadeIn(500, function () {

        });
    });

    setTimeout(function () {
        $("#game-panel").fadeOut(500, function () {
            // Change the html of the score-panel to the play again button
            $("#score-panel").html("<button id='play-again' onclick='rematch()'>rematch!</button>&nbsp;<button id='quit' onclick='quit()'>quit</button>");

            $("#score-panel").fadeIn(500, function () {

            });
        });
    }, 3000);
}


socket.on("generated-url", createRoom);

function createRoom(id) {
    roomID = id;

    // Add event listeners to the room
    $("#invite-menu").html("share this code with your friend: <span class='code'>" + roomID +
        "</span><br><b>stay on this page</b>. you will be automatically paired once your friend joins.");
}

socket.on("invalid", alertError);

function alertError() {
    alert("The code you entered is invalid.");
}

socket.on("paired", initializeGame);

function initializeGame(room, initialized) {
    roomID = room;

    gameOver = false;
    gameOverTrigger = false;

    solved = false;

    path = ["0-0"];

    userX = 0;
    userY = 0;

    complete = false;

    locked = false; // enable user movement

    if (!initialized) {
        $("#canvas-wrapper").hide();
        $("#canvas2-wrapper").show();
        myp25 = new p5(mazeDisplay, "canvas2-wrapper"); // This is where the error is happening
    } else {

    }

    $("#score-panel").fadeOut(500);

    $("#join-menu").removeClass();
    $("#join-menu").addClass("animated fadeOutLeft");
    $("#join-menu").css({
        display: "none"
    });

    $("#invite-menu").removeClass();
    $("#invite-menu").hide();
    $("#invite-menu").addClass("animated fadeOutLeft");

    //locked = true;

    $("#game-panel").html("Time Elapsed: 0:00");
    $("#game-panel").show();
    $("#game-panel").addClass("animated fadeInRight");

    $("#game-panel").fadeOut(500, function () {
        // Change the html of the score-panel to the play again button
        $("#game-panel").html("Time Elapsed: 0:00");

        $("#game-panel").fadeIn(500, function () {

        });
    });

    singlePlayerComplete = true;
    timer.reset();
    timer.start();
    timer.addEventListener("secondsUpdated", updateTime);
}

socket.on("maze", downloadMaze);

function downloadMaze(newMaze) {
    // Check if the mazes are new mazes
    maze = newMaze;
}

function drawPath(p, path) {
    if (path.length >= 1) {
        p.strokeWeight(2);
        p.stroke(98, 244, 88);

        var prev = path[0];

        var components = prev.split("-");

        var prevRow = parseInt(components[0]);
        var prevColumn = parseInt(components[1]);

        p.line(10, 10, column * 20 + 10, row * 20 + 10);

        for (var k = 1; k < path.length; k++) {
            var pathCell = path[k];
            components = pathCell.split("-");
            var row = components[0];
            var column = components[1];

            p.line(prevColumn * 20 + 10, prevRow * 20 + 10, column * 20 + 10, row * 20 + 10);
            prev = pathCell.split("-");

            prevRow = prev[0];
            prevColumn = prev[1];
        }

        p.strokeWeight(1);
    }
}

function calculateCellDivision(maze, wall) {
    // Calculate the two cells that the wall divides
    // For example:
    // If the wall is [10, 11, "N"]
    // The two cells that the wall divides are (10, 11) and (9, 11)

    var row = wall[0];
    var col = wall[1];

    var cell1 = maze.cellGraph[row][col]; // Get the cell of the wall

    // Get the corresponding vector based upon the direction of the wall
    var vectorIndex = directions.indexOf(wall[2]);

    // Add the vector to the position of cell1
    var cell2Row = parseInt(cell1.row) + vectors[vectorIndex][0];
    var cell2Column = parseInt(cell1.column) + vectors[vectorIndex][1];

    if (cell2Row < 0 || cell2Row >= maze.cellGraph.length ||
        cell2Column < 0 || cell2 >= maze.cellGraph[0].length) {
        return -1;
    }

    var cell2 = maze.cellGraph[cell2Row][cell2Column]; // Get the corresponding cell

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

function movementController(key) {
    /*
        Controls all the logic behind the user's movement on the board
    */
    var cellString = "";

    if (key === 'w' || key === 'W') {
        if (singlePlayerUserPosition && !singlePlayerUserPosition.walls[0]) {
            userY -= 1;

            cellString = userY + "-" + userX;

            if (singlePlayerPath.indexOf(cellString) == -1) {
                singlePlayerPath.push(cellString);
            } else if (cellString == "0-0") {
                singlePlayerPath = ["0-0"];
            } else {
                singlePlayerPath.pop();
            }
        }
    }

    if (key === 's' || key === 'S') {
        if (singlePlayerUserPosition && !singlePlayerUserPosition.walls[2]) {
            userY += 1;

            cellString = userY + "-" + userX;

            if (singlePlayerPath.indexOf(cellString) == -1) {
                singlePlayerPath.push(cellString);
            } else if (cellString == "0-0") {
                singlePlayerPath = ["0-0"];
            } else {
                singlePlayerPath.pop();
            }
        }
    }

    if (key === 'a' || key === 'A') {
        if (singlePlayerUserPosition && !singlePlayerUserPosition.walls[3]) {
            userX -= 1;

            cellString = userY + "-" + userX;

            if (singlePlayerPath.indexOf(cellString) == -1) {
                singlePlayerPath.push(cellString);
            } else if (cellString == "0-0") {
                singlePlayerPath = ["0-0"];
            } else {
                singlePlayerPath.pop();
            }
        }
    }

    if (key === 'd' || key === 'D') {
        if (singlePlayerUserPosition && !singlePlayerUserPosition.walls[1]) {
            userX += 1;

            cellString = userY + "-" + userX;

            if (singlePlayerPath.indexOf(cellString) == -1) {
                singlePlayerPath.push(cellString);
            } else if (cellString == "0-0") {
                singlePlayerPath = ["0-0"];
            } else {
                singlePlayerPath.pop();
            }
        }
    }

    return cellString;
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}


function deleteWall(current, neighbor) {
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


function generateMaze(inputMaze) {
    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
    var pos = getRandomPos(inputMaze.cellGraph[0].length, inputMaze.cellGraph.length);

    var row = pos[0];
    var column = pos[1];

    inputMaze.cellGraph[row][column].visited = true;

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

        var components = calculateCellDivision(inputMaze, randomWall);

        if (components != -1) {

            var numVisited = components[2];

            var cell1 = components[0];
            var cell2 = components[1];

            // If only one of the two cells that the wall divides is visited, then:
            //  1. Make the wall a passage and mark the unvisited cell as part of the maze.
            //  2. Add the neighboring walls of the cell to the wall list.
            //     Remove the wall from the list.
            if (numVisited == 1) {
                deleteWall(cell1, cell2);

                var unvisitedCell = inputMaze.cellGraph[components[3].row][components[3].column];
                unvisitedCell.visited = true;

                var unvisitedString = unvisitedCell.row + "|" + unvisitedCell.column;

                // Add the neighboring walls of the cell to the wall list
                // Format of the walls (by index):
                // 0 = top, 1 = right, 2 = bottom, 3 = left
                var computedFrontierWalls = inputMaze.computeFrontierWalls(unvisitedCell.row, unvisitedCell.column);

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

    return inputMaze;
}


// Following construct is for multi-player maze
var mazeDisplay = function (p) {
    p.setup = function () {
        var canvas = p.createCanvas(700, 460);
        p.background(0, 0, 0);

        // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
        var pos = getRandomPos(maze.cellGraph[0].length, maze.cellGraph.length);

        var row = pos[0];
        var column = pos[1];

        maze.cellGraph[row][column].visited = true;

        for (var k = 0; k < directions.length; k++) {
            var key = row.toString() + column.toString() + directions[k].toString();

            if (!wallList[key]) {
                wallList[key] = [row, column, directions[k]];
            }
        }
    }

    Cell.prototype.display = function () {
        p.stroke(255, 255, 255);
        if (this.walls[0] && this.row != 0) { // Top
            p.line(this.xPos, this.yPos, this.xPos + this.cellSize, this.yPos);
        }
        if (this.walls[1] && this.column != singlePlayerCurrent.widthCells - 1) { // Right
            p.line(this.xPos + this.cellSize, this.yPos, this.xPos + this.cellSize, this.yPos + this.cellSize);
        }
        if (this.walls[2] && this.row != singlePlayerCurrent.heightCells - 1) { // Bottom
            p.line(this.xPos + this.cellSize, this.yPos + this.cellSize, this.xPos, this.yPos + this.cellSize);
        }
        if (this.walls[3] && this.column != 0) { // Left
            p.line(this.xPos, this.yPos + this.cellSize, this.xPos, this.yPos);
        }
        p.noStroke();
    }

    p.displayMaze = function (maze) {
        for (var i = 0; i < maze.cellGraph.length; i++) { // Iterate through row
            for (var j = 0; j < maze.cellGraph[i].length; j++) { // Iterate through every column
                var cell = maze.cellGraph[i][j]; // Display the cell

                p.stroke(255, 255, 255);
                if (cell.walls[0] && cell.row != 0) { // Top
                    p.line(cell.xPos, cell.yPos, cell.xPos + cell.cellSize, cell.yPos);
                }
                if (cell.walls[1] && cell.column != maze.widthCells - 1) { // Right
                    p.line(cell.xPos + cell.cellSize, cell.yPos, cell.xPos + cell.cellSize, cell.yPos + cell.cellSize);
                }
                if (cell.walls[2] && cell.row != maze.heightCells - 1) { // Bottom
                    p.line(cell.xPos + cell.cellSize, cell.yPos + cell.cellSize, cell.xPos, cell.yPos + cell.cellSize);
                }
                if (cell.walls[3] && cell.column != 0) { // Left
                    p.line(cell.xPos, cell.yPos + cell.cellSize, cell.xPos, cell.yPos);
                }
                p.noStroke();
            }
        }
    }

    Cell.prototype.highlight = function () {
        p.noFill();
        p.stroke("#ffffff");
        p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
        p.fill(98, 244, 88);
    }

    function deleteWall(current, neighbor) {
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

    p.draw = function () {
        if (mode == "one-on-one") {
            if (!gameOverTrigger) {

                if (maze) {
                    p.clear();
                    p.displayMaze(maze);

                    userPosition = maze.cellGraph[userY][userX];

                    p.fill(98, 244, 88);
                    p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);

                    // Draw the path
                    drawPath(p, path);

                    p.ellipse(maze.numColumns * 20 - 10, maze.numRows * 20 - 10, 5, 5);
                }
            }

            if (gameOver) {
                gameOverTrigger = true;
            }
        }

        if (mode == "single-player") {
            p.clear();

            // Draw the maze
            for (var i = 0; i < maze.cellGraph.length; i++) { // Iterate through row
                for (var j = 0; j < maze.cellGraph[i].length; j++) { // Iterate through every column
                    maze.cellGraph[i][j].display(); // Display the cell
                }
            }

            // Change the generating maze text
            if (!singlePlayerTimeElapsedFadeIn) {
                $("#game-panel").fadeOut(500, function () {
                    // Change the html of the score-panel to the play again button
                    $("#game-panel").html("time elapsed: 0:00");

                    $("#game-panel").fadeIn(500, function () {

                    });
                });

                timer.reset();
                timer.start();
                timer.addEventListener("secondsUpdated", updateTime);

                singlePlayerTimeElapsedFadeIn = true;
            }

            singlePlayerUserPosition = maze.cellGraph[userY][userX];

            p.fill(98, 244, 88);
            p.ellipse(singlePlayerUserPosition.xPos + singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.yPos + singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.cellSize / 2);

            drawPath(p, singlePlayerPath);

            //console.log("maze.numColumns * 20 + 10 = " + (maze.numColumns * 20 + 10) + ", maze.numRows * 20 + 10 = " + (maze.numRows * 20 + 10));
            p.ellipse(maze.numColumns * 20 - 10, maze.numRows * 20 - 10, 5, 5);
        }
    }

    p.keyTyped = function () {
        if (!locked) {
            if (mode == "single-player") {
                if (singlePlayerComplete) {
                    var cellString = "";

                    if (p.key === 'w' || p.key === 'W') {
                        cellString = movementController("w");
                    }
                    if (p.key === 's' || p.key === 'S') {
                        cellString = movementController("S");
                    }
                    if (p.key === 'a' || p.key === 'A') {
                        cellString = movementController("A");
                    }
                    if (p.key === 'd' || p.key === 'D') {
                        cellString = movementController("D");
                    }

                    var endPosition = (maze.numRows - 1).toString() + "-" + (maze.numColumns - 1).toString();

                    if (cellString == endPosition) {
                        singlePlayerSolved = true;
                        singlePlayerTimeElapsedFadeIn = true;

                        timer.removeEventListener("secondsUpdated", updateTime);

                        // Lock the movement controls
                        locked = true;

                        $("#game-panel").fadeOut(500, function () {
                            $("#game-panel").html("You solved the maze in " + timer.getTimeValues().toString(["minutes", "seconds"]) + "!");

                            $("#game-panel").fadeIn(500, function () {

                            });
                        });

                        setTimeout(function () {
                            $("#game-panel").fadeOut(500, function () {
                                $("#score-panel").html("<button id='play-again-button' onclick='replay()'>Play Again?</button>&nbsp;<button id='quit-button' onclick='quit()'>Quit</button>");
                                $("#score-panel").removeClass();
                                $("#score-panel").show();
                                $("#score-panel").fadeIn(500, function () {

                                });
                            });
                        }, 3000);
                    }
                }

                singlePlayerUserPosition = maze.cellGraph[userY][userX];
            }

            if (mode == "one-on-one") {
                //if (complete) {
                var cellString = "";

                if (p.key === 'w' || p.key === 'W') {
                    if (userPosition && !userPosition.walls[0]) {
                        userY -= 1;

                        cellString = userY + "-" + userX;

                        if (path.indexOf(cellString) == -1) {
                            path.push(cellString);
                        } else if (cellString == "0-0") {
                            path = ["0-0"];
                        } else {
                            path.pop();
                        }
                    }
                }
                if (p.key === 's' || p.key === 'S') {
                    if (userPosition && !userPosition.walls[2]) {
                        userY += 1;

                        cellString = userY + "-" + userX;

                        if (path.indexOf(cellString) == -1) {
                            path.push(cellString);
                        } else if (cellString == "0-0") {
                            path = ["0-0"];
                        } else {
                            path.pop();
                        }
                    }
                }
                if (p.key === 'a' || p.key === 'A') {
                    if (userPosition && !userPosition.walls[3]) {
                        userX -= 1;

                        cellString = userY + "-" + userX;

                        if (path.indexOf(cellString) == -1) {
                            path.push(cellString);
                        } else if (cellString == "0-0") {
                            path = ["0-0"];
                        } else {
                            path.pop();
                        }
                    }
                }
                if (p.key === 'd' || p.key === 'D') {
                    if (userPosition && !userPosition.walls[1]) {
                        userX += 1;

                        cellString = userY + "-" + userX;

                        if (path.indexOf(cellString) == -1) {
                            path.push(cellString);
                        } else if (cellString == "0-0") {
                            path = ["0-0"];
                        } else {
                            path.pop();
                        }
                    }
                }

                if (cellString == "22-34") {
                    solved = true;
                    socket.emit("winner", roomID);

                    $("#game-panel").fadeOut(500, function () {
                        $("#game-panel").html("You won the match!");
                        $("#game-panel").fadeIn(500);
                        singlePlayerComplete = false;
                        locked = true;
                    });

                    setTimeout(function () {
                        $("#game-panel").fadeOut(500, function () {
                            $("#game-panel").html("Waiting for your opponent to request a rematch<span class='dots'><span class='dot'>.</span class='dot'><span>.</span class='dot'><span>.</span></span>");
                            $("#game-panel").fadeIn(500);
                        });
                    }, 3000);
                }
            }

            userPosition = maze.cellGraph[userY][userX];

            if (!gameOver) {
                //socket.emit("position", [socket.id, roomID, userPosition]);
            }
        }

        return false;
        //}
    }
};


function quit() {
    location.href = "http://www.mazebattles.com/";
}


function replay() {
    locked = false;

    // Regenerate maze
    // If win, ask to play again
    // If no, redirect back to main page
    // If yes, regenerate maze again
    mode = "single-player";
    singlePlayerSolved = false;
    singlePlayerComplete = false;
    singlePlayerTimeElapsedFadeIn = false;

    timer = new Timer();

    singlePlayerUserPosition = "0-0";
    userY = 0;
    userX = 0;

    maze = new Maze(23, 35);
    maze.createMaze();
                singlePlayerComplete = false;

            maze = generateMaze(maze);

            singlePlayerComplete = true;

    singlePlayerCurrent = maze.cellGraph[0][0];


    singlePlayerPath = ["0-0"];
    numVisited = 0;

    $("#score-panel").removeClass();
    $("#score-panel").addClass("animated fadeOutLeft");

    wallList = {};

    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
    var pos = getRandomPos(maze.cellGraph[0].length, maze.cellGraph.length);

    var row = pos[0];
    var column = pos[1];

    maze.cellGraph[row][column].visited = true;

    for (var k = 0; k < directions.length; k++) {
        var key = row.toString() + column.toString() + directions[k].toString();

        if (!wallList[key]) {
            wallList[key] = [row, column, directions[k]];
        }
    }
}


function rematch() {
    /*
        If no:
            redirect the user to the main page
            send a request to the server to destroy the room
            server-side: destroy the room

        If yes:
            send a request to the opponent for a rematch
                if opponent says no
                    redirect the user to the main page
                    server-side: destroy the room

                if opponent says yes
                    send a request to the server that a rematch is agreed
                    regenerate the maze client-side
                    send the maze to the server, set the room's maze
                    then repeat the pairing process
    */
    socket.emit("rematch", roomID);

    $("#score-panel").fadeOut(500, function () {
        // Change the html of the score-panel to the play again button
        $("#game-panel").html("Waiting for your opponent to accept the rematch<span class='dots'><span class='dot'>.</span class='dot'><span>.</span class='dot'><span>.</span></span>");

        $("#game-panel").fadeIn(500, function () {

        });
    });
}



socket.on("rematchrequest", handleRematch);

function handleRematch() {
    $("#game-panel").fadeOut(500, function () {
        // Change the html of the score-panel to the play again button
        $("#game-panel").html("Your opponent has requested a rematch. Do you accept?");

        $("#game-panel").fadeIn(500, function () {

        });
    });

    setTimeout(function () {
        $("#game-panel").fadeOut(500, function () {
            // Change the html of the score-panel to the play again button
            $("#score-panel").html("<button id='play-again' onclick='acceptRematch(true)'>accept!</button>&nbsp;<button id='quit' onclick='acceptRematch(false)'>deny</button>");

            $("#score-panel").fadeIn(500, function () {

            });
        });
    }, 3000);
}

function acceptRematch(accept) {
    if (accept) {
        // Regenerate the maze
        maze = new Maze(23, 35);
        maze.createMaze();
        maze = generateMaze(maze);

        socket.emit("acceptRematch", true, maze, roomID);
    }
}





socket.on("disconnectedUser", userDisconnect);

function userDisconnect() {
    alert("Your opponent has disconnected from the match.");
    location.href = "http://www.mazebattles.com/"
}
