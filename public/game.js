var inactivityChecker; // Checks whether the user has been inactive or not

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

var mazeDisplay = function(p) {
    p.setup = function() {
        var canvas = p.createCanvas(500, 400);
        p.background(0, 0, 0);
    }

    p.displayMaze = function() {
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

    p.draw = function() {
        p.clear();

        if (maze) {
            p.displayMaze();

            if (complete) {
                userPosition = maze.cellGraph[userY][userX];

                p.fill("#eb42f4");
                p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);
            } else {
                if (current) {
                    p.noFill();
                    p.stroke(0, 0, 0);
                    p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
                    p.fill(0, 0, 0);
                }
            }
        }

        p.fill(0, 0, 0);
        p.ellipse(587.5, 387.5, 12.5, 12.5);
    }

    p.keyTyped = function() {
        if (complete && solved) {
            if (p.key === 'w' || p.key === 'W') {
                if (userPosition && !userPosition.walls[0]) {
                    userY -= 1;

                    var cellString = userY + "-" + userX;

                    if (solution.indexOf(cellString) > -1 && path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 's' || p.key === 'S') {
                if (userPosition && !userPosition.walls[2]) {
                    userY += 1;

                    var cellString = userY + "-" + userX;

                    if (solution.indexOf(cellString) > -1 && path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 'a' || p.key === 'A') {
                if (userPosition && !userPosition.walls[3]) {
                    userX -= 1;

                    var cellString = userY + "-" + userX;

                    if (solution.indexOf(cellString) > -1 && path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }
            if (p.key === 'd' || p.key === 'D') {
                if (userPosition && !userPosition.walls[1]) {
                    userX += 1;

                    var cellString = userY + "-" + userX;

                    if (solution.indexOf(cellString) > -1 && path.indexOf(cellString) == -1) {
                        path.push(cellString);
                    }

                    solvedPercentage = percentageSolved(solution, path);
                }
            }

            $("#opponent-progress").text("Opponent Progress: " + opponentProgress + "% | Race.");
        }

        userPosition = maze.cellGraph[userY][userX];
        socket.emit("position", [socket.id, userPosition]);
        socket.emit("solvedPercentage", [socket.id, solvedPercentage]);

        clearTimeout(inactivityChecker);
        inactivityChecker = setTimeout(inactivity, 30000);
    }
};

socket.on("generated-url", function (data) {
  console.log("data = " + data);
  $("#invite-menu").html("Share this code with your friend: <span class='code'>" + data 
    + "</span><br>Stay on this page. You will be paired once your friend joins.");
});

socket.on("paired", function(data) {
    console.log("paired with user!");

    solved = false;
    solvedPercentage = 0;
    opponentProgress = 0;
    path = [];

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

  maze = data;
});

socket.on("complete", function(data) {
    complete = true;
    inactivityChecker = setTimeout(inactivity, 30000);

    solution = solve(maze);
    solved = true;
});

socket.on("modifyCell", function(data) {
    current = data;

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
        maze.cellGraph[current.row][current.column].visited = false;
    }
});