var inactivityChecker; // Checks whether the user has been inactive or not

function Maze(widthCells, heightCells) {
  /*
    Defines a maze object b
  */
  maze.widthCells = widthCells;
  maze.heightCells = heightCells;
  this.numCells = widthCells * heightCells;
  maze.cellGraph = [];

  for (var i = 0; i < heightCells; i++) {
    maze.cellGraph.push([]);
  }
}

function Cell(cellSize, row, column) {
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

    $("#one-on-one-wrapper").removeClass("animated fadeInRight");
    $("#one-on-one-wrapper").addClass("animated fadeOutLeft");
  });

  $("#invite").click(function () {
    $("#one-on-one-wrapper").removeClass("animated fadeInRight");
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

socket.on("generated-url", function (data) {
  console.log("data = " + data);
  $("#invite-menu").html("Share this code with your friend: " + data + "<br>Stay on this page. You will be paired once your friend joins.");
});

socket.on("paired", function(data) {
    if (myp25 == null) {
        myp25 = new p5(mazeDisplay, "canvas2-wrapper");
    }
});

socket.on("code-validity", function (valid) {
  if (!valid) {
    alert("The code you entered is invalid");
  } else {
    $("#join-menu").removeClass("animated fadeInRight");
    $("#join-menu").addClass("animated fadeOutLeft");

    $("#game-panel").show();
    $("#game-panel").addClass("animated fadeInRight");
  }
});

socket.on("initial-maze", function (data) {
  // Fade out the start maze
  $("#canvas-wrapper").hide();
  maze = data;
});

socket.on("modifyCell", function(data) {
    current = data;

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
        maze.cellGraph[current.row][current.column].visited = false;
    }
});