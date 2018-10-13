var inactivityChecker; // Checks whether the user has been inactive or not
var roomID = "";

function inactivity() {
    socket.emit("activitytimeout", true);
}

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

function solve(maze) {
    var queue = new Queue();
    var start = maze.cellGraph[0][0]; // Start position is the left corner of the maze
    start.visited = true;
    queue.enqueue(start);

    var prev = {}; // Used for backtracking path

    while (!queue.isEmpty()) {
        var curr = queue.dequeue();

        if (curr.row == 15 && curr.column == 19) {
            break;
        }

        var neighbors = getNeighbor(false, curr.row, curr.column);

        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            if (!neighbor.visited) {
                queue.enqueue(neighbor);
                neighbor.visited = true;
                prev[neighbor.row + "-" + neighbor.column] = curr; // Reverse
            }
        }
    }

    // Reconstruct path
    var path = ["0-0"];
    var iter = maze.cellGraph[15][19]; // Start at end point
    var previous = prev[iter.row + "-" + iter.column];

    while (iter != null) {
        if (iter.row == 0 && iter.column == 0) {
            break;
        }

        var cellString = iter.row + "-" + iter.column;
        path.push(cellString);

        iter = prev[iter.row + "-" + iter.column];
    }

    path = path.reverse();

    return path;
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

function percentageSolved(solution, path) { //asdf
    return (100 * path.length / solution.length);
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

// Solving maze
var solution;
var solved = false;
var solvePercentage = 0;
var path = [];

var displayedSolution = false;

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
                console.log("user inputted room code");

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
function star(x, y, radius1, radius2, npoints) {
  var angle = TWO_PI / npoints;
  var halfAngle = angle/2.0;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius2;
    var sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

var mazeDisplay = function (p) {
    p.setup = function () {
        var canvas = p.createCanvas(500, 400);
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
        p.clear();

        if (maze) {
            p.displayMaze();

            if (complete) {
                userPosition = maze.cellGraph[userY][userX];

                p.fill(98, 244, 88);
                p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);

                // Draw the path
                if (path.length >= 1) {
                    //if (solved) {
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

    p.keyTyped = function () {
        if (complete) {
            if (p.key === 'w' || p.key === 'W') {
                if (userPosition && !userPosition.walls[0]) {
                    userY -= 1;

                    var cellString = userY + "-" + userX;

                    if (path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    } else if (cellString == "0-0") {
                        path = ["0-0"];
                    } else {
                        path.pop();
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 's' || p.key === 'S') {
                if (userPosition && !userPosition.walls[2]) {
                    userY += 1;

                    var cellString = userY + "-" + userX;

                    if (path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    } else if (cellString == "0-0") {
                        path = ["0-0"];
                    } else {
                        path.pop();
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 'a' || p.key === 'A') {
                if (userPosition && !userPosition.walls[3]) {
                    userX -= 1;

                    var cellString = userY + "-" + userX;

                    if (path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    } else if (cellString == "0-0") {
                        path = ["0-0"];
                    } else {
                        path.pop();
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 'd' || p.key === 'D') {
                if (userPosition && !userPosition.walls[1]) {
                    userX += 1;

                    var cellString = userY + "-" + userX;

                    if (path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    } else if (cellString == "0-0") {
                        path = ["0-0"];
                    } else {
                        path.pop();
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }

            //$("#game-panel").text("Opponent Progress: " + opponentProgress + "% | Race.");
        }

        userPosition = maze.cellGraph[userY][userX];
        console.log("emitting position");
        socket.emit("position", [socket.id, roomID, userPosition]);
        socket.emit("solvedPercentage", [socket.id, solvedPercentage]);

        clearTimeout(inactivityChecker);
        inactivityChecker = setTimeout(inactivity, 30000);
    }
};

socket.on("generated-url", function (data) {
    console.log("data = " + data);
    $("#invite-menu").html("Share this code with your friend: <span class='code'>" + data +
        "</span><br>Stay on this page. You will be paired once your friend joins.");
});

socket.on("paired", function (data) {
    roomID = data;
    socket.room = roomID;

    solved = false;
    solvedPercentage = 0;
    opponentProgress = 0;
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

    $("#join-menu").removeClass();
    $("#join-menu").addClass("animated fadeOutLeft");

    $("#invite-menu").removeClass();
    $("#invite-menu").hide();
    $("#invite-menu").addClass("animated fadeOutLeft");

    $("#game-panel").show();
    $("#game-panel").addClass("animated fadeInRight");
});

socket.on("winner", function (winnerID) {
    var win = false;
    var winText = "You lost the match. Your record against your opponent is 0:0";

    if (socket.id == winnerID) {
        win = true;
    }

    if (win) {
        winText = "You won the match. Your record against your opponent is 0:0";
    }

    $("#game-panel").fadeOut("fast", function() {
        $("#score-panel").fadeIn("fast", function() {
            $("#score-panel").text(winText);
            console.log("Mechanism successful.");
        });
    });

    clearTimeout(inactivityChecker);
});

socket.on("scores", function (scoreMapping) {
    var wonMatch = false;

    for (var userID in scoreMapping) {
        if (userID == socket.id) {
            //$("#opponent-progress").text("You won the duel. The record is now ");
            wonMatch = true;
        }
    }

    if (wonMatch) {
        $("#game-panel").html("You won the match. You have ___ wins while your opponent has ___ wins.")
    } else {
        $("#game-panel").html("You lost the match. You have ___ wins while your opponent has ___ wins.")
    }

    //$("#game-panel").removeClass();
    //$("#game-panel").addClass("animated fadeInRight");
})

// Need to include logic that alerts the user when the room cannot be joined!

socket.on("code-validity", function (valid) {
    if (!valid) {
        alert("The code you entered is invalid");
    }
});

socket.on("initial-maze", function (data) {
    console.log("initial maze received");
    // Fade out the start maze
    $("#canvas-wrapper").hide();
    $("#canvas2-wrapper").show();
    $("#join-menu").hide();

    maze = data;
});

socket.on("complete", function (data) {
    complete = true;
    inactivityChecker = setTimeout(inactivity, 30000);

    solution = solve(maze);
    solved = true;
});

socket.on("modifyCell", function (data) {
    current = data;

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
        maze.cellGraph[current.row][current.column].visited = false;
    }
});

socket.on("completeGeneration", function (data) {
    $("#game-panel").text("Opponent Progress: 0% / Time Elapsed: 0:00")
});