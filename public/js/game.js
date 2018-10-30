var inactivityChecker; // Checks whether the user has been inactive or not
var roomID = "";

var gameOver = false;
var gameOverTrigger = false;

var solved = false;

var timer = new Timer();

function inactivity() {
    socket.emit("activitytimeout", true);
}

// DFS is a parameter that specifies whether getNeighbor is going through the generation phase or
// the search phase
function getNeighbor(dfs, cellRow, cellColumn) { // Get all of the neighbors of a specific cell in the maze
    var neighbors = []; // The list of all the neighbors of that cell
    var coordinates = []; // The list of the coordinates of the neighbors of that cell

    if (cellColumn > 0) { // If the cell isn't on the left side, there is a neighbor to the left
        var neighbor = maze.cellGraph[cellRow][cellColumn - 1]; // Get the neighboring cell to the left

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow, cellColumn - 1]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWallPos([cellRow, cellColumn], [neighbor.row, neighbor.column])) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellColumn < maze.widthCells - 1) { // If the cell isn't on the right side, there is a neighbor to the right
        var neighbor = maze.cellGraph[cellRow][cellColumn + 1]; // Get the neighboring cell to the right

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow, cellColumn + 1]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWallPos([cellRow, cellColumn], [neighbor.row, neighbor.column])) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellRow > 0) { // If the cell isn't on the top side, there is a neighbor to the top
        var neighbor = maze.cellGraph[cellRow - 1][cellColumn]; // Get the neighboring cell to the top

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow - 1, cellColumn]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWallPos([cellRow, cellColumn], [neighbor.row, neighbor.column])) {
                neighbors.push(neighbor);
            }
        }
    }
    if (cellRow < maze.heightCells - 1) { // If the cell isn't on the bottom side, there is a neighbor to the bottom
        var neighbor = maze.cellGraph[cellRow + 1][cellColumn]; // Get the neighboring cell to the bottom

        if (dfs) { // If dfs = true, getNeighbor returns a random neighbor
            if (!neighbor.visited) {
                coordinates.push([cellRow + 1, cellColumn]);
                neighbors.push(neighbor);
            }
        } else {
            if (!isWallPos([cellRow, cellColumn], [neighbor.row, neighbor.column])) {
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

function isWallPos(cellAPos, cellBPos) {
    // Whether there's a wall or not depends on the orientation of the blocks
    // If it's vertical, it has to be false between even numbers
    // If it's horizontal, it has to be false between odd numbers
    var cellA = maze.cellGraph[cellAPos[0]][cellAPos[1]];
    var cellB = maze.cellGraph[cellBPos[0]][cellBPos[1]];

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

function equalCells(cell1, cell2) {
    return cell1.row == cell2.row && cell1.column == cell2.column;
}

function inPath(path, x, y) {
    for (var i = 0; i < path.length; i++) {
        var cell = path[i];

        if (cell.column == x && cell.row == y) {
            return true;
        }
    }

    return false;
}

function Maze(widthCells, heightCells) {
    /*
      Defines a maze object based on its width and height
    */
    maze.widthCells = widthCells;
    maze.heightCells = heightCells;
    this.numCells = widthCells * heightCells;
    maze.cellGraph = [];

    for (var i = 0; i < heightCells; i++) {
        /*
          Initializes the cell graph of a maze by adding empty rows
        */
        maze.cellGraph.push([]);
    }
}

function Cell(cellSize, row, column) {
    /*
      Defines a cell object based on its dimensions and location on the cell graph
    */
    this.cellSize = cellSize;
    this.column = column;
    this.row = row;
    this.xPos = column * cellSize;
    this.yPos = row * cellSize;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.marked = false;
    this.examined = false;
    this.parentCell = null;
}

var maze;
var current;
var complete = false;
var myp25;
var userPosition;

var playing = false;
var gamecomplete = false;

var userX = 0;
var userY = 0;

var path = [];

var opponentProgress = 0;

$("#content").fadeIn();

// Retrieve the 

$("#one-on-one").click(function () {
    // Display the new One-on-One layout
    // Two buttons: Joining a match and Inviting others to the match
    // Fade out play-wrapper, and fade in the one-on-one-wrapper
    $("#play-wrapper").addClass("animated fadeOutLeft");

    // Make the one-on-one-wrapper visible
    $("#play-wrapper").hide();
    $("#one-on-one-wrapper").show();

    $("#one-on-one-wrapper").addClass("animated fadeInRight");

    $("#join").click(function () {
        $("#one-on-one-wrapper").hide();

        $("#one-on-one-wrapper").removeClass();
        $("#one-on-one-wrapper").addClass("animated fadeOutLeft");
    });

    $("#invite").click(function () {
        $("#one-on-one-wrapper").removeClass();
        $("#one-on-one-wrapper").addClass("animated fadeOutLeft");

        // Make the invite sub menu visible
        $("#text-container").hide();
        $("#invite-menu").show();
        $("#invite-menu").addClass("animated fadeInRight");

        socket.emit("invite", true);
    });

    $("#join").click(function () {
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
                    // send request to server containing code emitted
                    socket.emit("room-code", $("#room-code").val());
                }
            }
        });
    });
});

// star function borrowed from p5.js examples  
function star(x, y, radius1, radius2, npoints, p) {
  var angle = 2 * Math.PI / npoints;
  var halfAngle = angle/2.0;
  p.beginShape();

  for (var a = 0; a < 2 * Math.PI; a += angle) {
    var sx = x + Math.cos(a) * radius2;
    var sy = y + Math.sin(a) * radius2;
    p.vertex(sx, sy);

    sx = x + Math.cos(a+halfAngle) * radius1;
    sy = y + Math.sin(a+halfAngle) * radius1;
    p.vertex(sx, sy);
  }

  p.endShape(p.CLOSE);
}

socket.on("complete", function (data) {
    inactivityChecker = setTimeout(inactivity, 30000);

});

var mazeDisplay = function (p) {
    p.setup = function () {
        var canvas = p.createCanvas(600, 400);
        p.background(0, 0, 0);
    }

    p.displayMaze = function () {
        for (var i = 0; i < maze.cellGraph.length; i++) {
            for (var j = 0; j < maze.cellGraph[i].length; j++) {
                p.stroke(255, 255, 255);
                var cell = maze.cellGraph[i][j];
                var numWalls = 0;

                for (var e = 0; e < cell.walls.length; e++) {
                    if (cell.walls[e]) {
                        numWalls += 1;
                    }
                }

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

        p.line(0, 400, 400, 400);
    }

    p.draw = function () {
        if (!gameOverTrigger) {
            p.clear();

            if (maze) {
                p.displayMaze();

                p.stroke(98, 244, 88);

                if (!solved) {
                    star(587.5, 387.5, 6, 1, 5, p);
                }

                if (complete) {
                    userPosition = maze.cellGraph[userY][userX];

                    p.fill(98, 244, 88);
                    p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);

                    // Draw the path
                    if (path.length >= 1) {
                        p.stroke(98, 244, 88);

                        var prev = path[0];

                        var components = prev.split("-");

                        var prevRow = parseInt(components[0]);
                        var prevColumn = parseInt(components[1]);

                        p.line(12.5, 12.5, column * 25 + 12.5, row * 25 + 12.5);

                        for (var k = 1; k < path.length; k++) {
                            var pathCell = path[k];
                            components = pathCell.split("-");
                            var row = components[0];
                            var column = components[1];

                            p.line(prevColumn * 25 + 12.5, prevRow * 25 + 12.5, column * 25 + 12.5, row * 25 + 12.5);
                            prev = pathCell.split("-");

                            prevRow = prev[0];
                            prevColumn = prev[1];
                        }
                    }
                } else {
                    if (current) {
                        p.noFill();
                        p.stroke(98, 244, 88);
                        p.ellipse(current.xPos + current.cellSize / 2, current.yPos + current.cellSize / 2, current.cellSize / 2, current.cellSize / 2);
                        p.fill(0, 0, 0);
                    }
                }
            }
        }

        if (gameOver) {
            gameOverTrigger = true;
        }
    }

    p.keyTyped = function () {
        if (complete) {
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

            if (cellString == "15-23") {
                solved = true;
            }
        }

        userPosition = maze.cellGraph[userY][userX];

        if (!gameOver) {
            socket.emit("position", [socket.id, roomID, userPosition]);
        }

        clearTimeout(inactivityChecker);
        inactivityChecker = setTimeout(inactivity, 30000);
    }
};

socket.on("generated-url", function (data) {
    $("#invite-menu").html("share this code with your friend: <span class='code'>" + data +
        "</span><br>stay on this page. you will be paired once your friend joins.");
});

// When user is disconnected
socket.on("opponentDisconnected", function (data) {
    $("#score-panel").fadeOut();
    $("#game-panel").fadeOut().html("your opponent has unfortunately disconnected.<br>you will be redirected to the main page.").fadeIn(300);
    

    setTimeout(function() {
        window.location = "http://localhost:3000";
    }, 3000);
});

socket.on("paired", function (data) {
    console.log("/////////////////////////////////////////////////////");


    gameOver = false;
    gameOverTrigger = false;

    solved = false;

    roomID = data;

    path = ["0-0"];

    userX = 0;
    userY = 0;

    if (inactivityChecker) {
        clearTimeout(inactivityChecker);
    }

    complete = false;

    if (myp25 == null) {
        myp25 = new p5(mazeDisplay, "canvas2-wrapper");
    }

    $("#score-panel").fadeOut(500);

    $("#join-menu").removeClass();
    $("#join-menu").addClass("animated fadeOutLeft");

    $("#invite-menu").removeClass();
    $("#invite-menu").hide();
    $("#invite-menu").addClass("animated fadeOutLeft");

    $("#game-panel").show();
    $("#game-panel").addClass("animated fadeInRight");
});

socket.on("winner", function (data) {
    gameOver = true;

    var win = false;
    var winText = "";

    var winnerID = data[0];
    var scores = data[1];

    if (socket.id == winnerID) {
        win = true;
    }

    var userScore;
    var opponentScore;

    for (var userID in scores) {
        if (userID == socket.id) {
            userScore = scores[userID];
        } else {
            opponentScore = scores[userID];
        }
    }

    if (win) {
        winText = "You won the match. Your record is <b>" + userScore + "</b>:" + opponentScore;
    } else {
        winText = "You lost the match. Your record is <b>" + userScore + "</b>:" + opponentScore;
    }

    $("#game-panel").fadeOut(500, function() {
        $("#score-panel").html(winText);
        
        $("#score-panel").fadeIn(500, function() {
            
        });
    });

    setTimeout(function() {
        $("#score-panel").fadeOut(500, function() {
            // Change the html of the score-panel to the play again button
            $("#score-panel").html("<div id='play-again' onclick='rematch()'>rematch!</div>&nbsp;<div id='quit' onclick='quit()'>quit</div>");

            $("#score-panel").fadeIn(500, function() {

            });
        });
    }, 4000);

    clearTimeout(inactivityChecker);
});

function quit() {
    window.location = "http://localhost:3000";
}

function rematch() {
    socket.emit("play-again", socket.id);

        $("#score-panel").fadeOut(500, function() {
            // Change the html of the score-panel to the play again button
            $("#score-panel").html("You have requested a rematch. Waiting for your opponent to respond...");

            $("#score-panel").fadeIn(500, function() {

            });
        });
}

$("#play-again").click(function() {
    // Send requrest to opponent that user wants to play again
    socket.emit("play-again", socket.id);

    // If opponent approves, regenerate the maze

});

// Need to include logic that alerts the user when the room cannot be joined!

socket.on("code-validity", function (valid) {
    if (!valid) {
        alert("The code you entered is invalid");
    }
});

socket.on("initial-maze", function (data) {
    timer.reset();
    
    // Fade out the start maze
    $("#game-panel").html("Generating maze...");
    $("#canvas-wrapper").hide();
    $("#canvas2-wrapper").show();
    $("#join-menu").hide();

    maze = data;
});

socket.on("modifyCell", function (data) {
    current = data;
    console.log("current.row, current.column = " + current.row + ", " + current.column);

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
        maze.cellGraph[current.row][current.column].visited = false;
    }
});

socket.on("completeGeneration", function (data) {
    timer.start();
    timer.addEventListener("secondsUpdated", function(e) {
        $("#game-panel").text("time elapsed: " + timer.getTimeValues().toString(["minutes", "seconds"]));
    });
    
    complete = true;
});

socket.on("rematch", function (data) {
    $("#score-panel").fadeOut(500, function() {
        // Change the html of the score-panel to the play again button
        $("#score-panel").html("Your opponent has requested a rematch. Do you accept?<div class='whitespace'></div>" + 
                "<div id='play-again' onclick='rematchagreement(true)'>yes</div>&nbsp;<div id='quit' onclick='rematchagreement(false)'>no</div>");

        $("#score-panel").fadeIn(500, function() {
        });
    });
});

function rematchagreement(agree) {
    socket.emit("rematchagreement", [socket.id, true]);
}