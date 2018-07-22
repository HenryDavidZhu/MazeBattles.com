// Implement path tracing

function Maze(widthCells, heightCells) {
    this.widthCells = widthCells;
    this.heightCells = heightCells;
    this.numCells = widthCells * heightCells;
    this.cellGraph = [];

    for (var i = 0; i < heightCells; i++) {
        this.cellGraph.push([]);
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

function solve(maze) {
    // Use BFS to solve the maze
    var nodeQueue = new Queue();
    var visitedCells = [];
    var traveledPath = [];

    var startingNode = maze.cellGraph[0][0];
    nodeQueue.enqueue(startingNode);
    visitedCells.push(startingNode);
    traveledPath.push(startingNode);

    while (!nodeQueue.isEmpty()) {
      var node = nodeQueue.dequeue();


    }
}

var mazeDisplay = function(p) {
    p.setup = function() {
        var canvas = p.createCanvas(600, 400);
        p.background(0, 0, 0);
    }

    Cell.prototype.highlight = function() {
        p.fill(255, 255, 255);
        p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
    }

    p.draw = function() {
        p.clear();

        if (maze) {
            for (var i = 0; i < maze.cellGraph.length; i++) {
                for (var j = 0; j < maze.cellGraph[i].length; j++) {
                    p.stroke("#ffffff");
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

            if (complete) {
                userPosition = maze.cellGraph[userY][userX];

                p.fill(255, 255, 255);
                p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);
            } else {
                p.fill(255, 255, 255);

                if (current) {
                    p.ellipse(current.xPos + current.cellSize / 2, current.yPos + current.cellSize / 2, current.cellSize / 2, current.cellSize / 2);
                }
            }
        }

        p.fill(255, 255, 255);
        p.ellipse(587.5, 387.5, 12.5, 12.5);
    }

    p.keyTyped = function() {
        console.log("key typed!");

        if (complete) {
            if (p.key === 'w' || p.key === 'W') {
                if (!userPosition.walls[0]) {
                    userY -= 1;
                }
            }
            if (p.key === 's' || p.key === 'S') {
                if (!userPosition.walls[2]) {
                    userY += 1;
                }
            }
            if (p.key === 'a' || p.key === 'A') {
                if (!userPosition.walls[3]) {
                    userX -= 1;
                }
            }
            if (p.key === 'd' || p.key === 'D') {
                if (!userPosition.walls[1]) {
                    userX += 1;
                }
            }
        }

        console.log("userX = " + userX + ", userY = " + userY);

        userPosition = maze.cellGraph[userY][userX];
        socket.emit("position", [socket.id, userPosition]);
    }
};

socket.on("paired", function(data) {
    complete = false;

    // Delete all duplicate canvas(es) inside element
    var canvasWrapper = document.getElementById("canvas2-wrapper");

    while (canvasWrapper.firstChild) {
        canvasWrapper.removeChild(canvasWrapper.firstChild);
    }

    $("#spinner").fadeOut();
    $("#loading-msg").fadeOut();
    $("#start-label").fadeOut();
    $("#play-again").fadeOut();
    $("#canvas2-wrapper").fadeIn();
    $("#title").fadeIn();
    $("#playing-against").fadeIn();
    $("#opponent-progress").fadeIn();
    $("#playing-against").css("display", "table");
    socket.emit("paired", socket.id);

    $("#play").text("0:00 / Opponent Progress: 0%")
    $("#play").fadeIn();
    $("#score-streak").fadeIn();

    myp25 = new p5(mazeDisplay, "canvas2-wrapper");

    // Launch the self adjusting timer
    // Time (final) = Time (initial) + delta(Time)
    /*
    var deltaTime = 1000;
    var initialTime = Date.now();
    var expectedTime = initialtime + deltaTime;

    setTimeout(updateTime, deltaTime);

    function updateTime() {
        var error = Date.now() - expectedTime;
    }*/
});

socket.on("completeGeneration", function(data) {
    $("#opponent-progress").text("Opponent Progress: 0% | Race!!!")
});

socket.on("winner", function(data) {
    userX = 0;
    userY = 0;

    console.log("receiving winner event");
    gamecomplete = true;

    $("#playing-against").fadeOut();
    $("#canvas2-wrapper").fadeOut();
    $("#play").fadeOut();
    $("#opponent-progress").fadeOut();
    $("#play-again").fadeOut();

    console.log("receiving winner event");

    $("#win-play-again").fadeIn();

    if (socket.id == data[0]) {
        var totalSeconds = data[1];

        var mins = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;

        $("#win-message").fadeIn();
        $("#mins").text(mins);

        var secondText = seconds;

        if (seconds < 10) {
            secondText = "0" + seconds;
        }

        $("#secs").text(secondText);
        $("#win-streak-win").text(data[2]);
    } else {
        console.log("You lost the match.");

        $("#lose-message").fadeIn();

        $("#win-streak-lose").text(data[2]);
        $("#play").fadeIn();
    }
});

socket.on("initialMaze", function(data) {
    maze = data;
});

socket.on("modifyCell", function(data) {
    console.log("receiving modify cell");
    current = data;

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
    }
});

socket.on("wins", function(data) {
    var wins = data[0];
    var winner = data[1];

    console.log("winner = " + winner);

    if (winner) {
        $("#score-streak").text("Win Streak: " + data[0]);
    }

    maze = undefined;
    current = undefined;
    userPosition = undefined;
});

socket.on("complete", function(data) {
    complete = true;
});

socket.on("disconnecting", function(data) {
    alert("Your opponent disconnected.");
    $("#playing-against").fadeOut();
    $("#canvas2-wrapper").fadeOut();
    $("#play").fadeOut();
    $("#win-message").fadeOut();
    $("#lose-message").fadeOut();
    $("#opponent-progress").fadeOut();

    $("#disconnect-message").fadeIn();
    $("#win-play-again").fadeIn();
});

socket.on('connect', () => {
    console.log(socket.id); // an alphanumeric id...
});
