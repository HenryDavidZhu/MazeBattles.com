// Implement path tracing

function Maze(widthCells, heightCells) {
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

/*
bfs(start, looking_for)
  create arrays (node_queue, visited_nodes, and traveled_path)
  add the start to the arrays
  while the queue is not empty
    take out the first element in the queue
    for each of the neighbors of this first element 
      if its not in the visited set and not blocked
        add this to the arrays
        if this contains what we are looking for
          return the backtrack of this node
        end if
      end if
    end for
  end while
end method
*/
function getNeighbor(dfs, cellRow, cellColumn) { // Get all of the neighbors of a specific cell in the maze
    var neighbors = []; // The list of all the neighbors of that cell
    var coordinates = []; // The list of the coordinates of the neighbors of that cell

    console.log("cellRow = " + cellRow + ", cellColumn = " + cellColumn);

    if (cellColumn > 0) { // If the cell isn't on the left side, there is a neighbor to the left
        var neighbor = maze.cellGraph[cellRow][cellColumn - 1]; // Get the neighboring cell to the left
        console.log("analyzing cell " + neighbor.row + ", " + neighbor.column);

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
    if (cellColumn < maze.widthCells - 1) { // If the cell isn't on the right side, there is a neighbor to the right
        var neighbor = maze.cellGraph[cellRow][cellColumn + 1]; // Get the neighboring cell to the right
        console.log("analyzing cell " + neighbor.row + ", " + neighbor.column);

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
        var neighbor = maze.cellGraph[cellRow - 1][cellColumn]; // Get the neighboring cell to the top
        console.log("analyzing cell " + neighbor.row + ", " + neighbor.column);

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
    if (cellRow < maze.heightCells - 1) { // If the cell isn't on the bottom side, there is a neighbor to the bottom
        var neighbor = maze.cellGraph[cellRow + 1][cellColumn]; // Get the neighboring cell to the bottom
        console.log("analyzing cell " + neighbor.row + ", " + neighbor.column);

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

function equalCells(cell1, cell2) {
    return cell1.row == cell2.row && cell1.column == cell2.column;
}

function solve(maze) {
    /* Use BFS to solve the maze
    var nodeQueue = new Queue();
    var visitedCells = [];
    var traveledPath = [];

    var startingNode = maze.cellGraph[0][0];
    var endNode = maze.cellGraph[15][15];

    nodeQueue.enqueue(startingNode);
    visitedCells.push(startingNode);
    traveledPath.push(startingNode);

    while (!nodeQueue.isEmpty()) {
      var node = nodeQueue.dequeue();

      console.log("current node analyzing: " + node.row + ", " + node.column);

      // Get the neighbors of the node
      var neighbors = getNeighbor(false, node.row, node.column);

      console.log(node.row + ", " + node.column + "'s neighbors: " + neighbors);

      for (var i = 0; i < neighbors.length; i++) {
        console.log(node.row + ", " + node.column + " walls: " + node.walls);
        if (!neighbors[i].visited && isWall(neighbors[i], node)) {
            nodeQueue.enqueue(neighbors[i]);
            visitedCells.push(neighbors[i]);
            traveledPath.push(neighbors[i]);

            if (equalCells(neighbors[i], endNode)) {
                return traveledPath;
            }
        }
      }
    }*/
}

var mazeDisplay = function(p) {
    p.setup = function() {
        var canvas = p.createCanvas(600, 400);
        p.background(0, 0, 0);
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
                if (current) {
                    p.noFill();
                    p.stroke(255, 255, 255);     
                    p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
                    p.fill(255, 255, 255);
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
    console.log(solve(maze));
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
    console.log(socket.id); // Print out the current socket's id
});

socket.on("disconnect", () => {
    console.log("You have been disconnected from the match.");
});

socket.on("inactivity", function(data) {
    alert("You have been disconnected due to inactivity.");
    $("#playing-against").fadeOut();
    $("#canvas2-wrapper").fadeOut();
    $("#play").fadeOut();
    $("#win-message").fadeOut();
    $("#lose-message").fadeOut();
    $("#opponent-progress").fadeOut();

    $("#disconnect-message").text("You have been disconnected due to inactivity.");
    $("#disconnect-message").fadeIn();
    $("#win-play-again").fadeIn();
});
