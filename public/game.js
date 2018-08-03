var inactivityChecker;

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

function inactivity() {
    socket.emit("activitytimeout", true);
}

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
        var neighbors = getNeighbor(false, curr.row, curr.column);

        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];

            if (!neighbor.visited) {
                queue.enqueue(neighbor);
                neighbor.visited = true;
                prev[curr.row + "-" + curr.column] = neighbor;
                console.log("setting " + curr.row + "-" + curr.column + " to " + neighbor.row + "-" + neighbor.column);
            }
        }
    }

    console.log("done solving maze");

    // Reconstruct path
    var path = [];
    var iter = maze.cellGraph[15][15]; // Start at end point
    var previous = prev[iter.row + "-" + iter.column];

    while (iter != null) {
        if (iter.row == 0 && iter.column == 0) {
            break;
        }
        
        path.push(iter);
        iter = prev[iter.row + "-" + iter.column];
    }

    path = path.reverse();

    return path;
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
            
                if (solved) {
                    var previous = solution[0];

                    for (var i = 1; i < solution.length; i++) {
                        p.stroke(56, 211, 255);
                        p.line(previous.row * 25 + 12.5, previous.column * 25 + 12.5, solution[i].row * 25 + 12.5, solution[i].column * 25 + 12.5);
                        previous = solution[i];
                    }
                }
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

        userPosition = maze.cellGraph[userY][userX];
        socket.emit("position", [socket.id, userPosition]);

        clearTimeout(inactivityChecker);
        inactivityChecker = setTimeout(inactivity, 30000);
    }
};

// Handle key events (not using p5.js' keyTyped because it triggers multiple events after a user plays a match
// after winning one)

socket.on("paired", function(data) {
    $("#opponent-progress").text("Opponent Progress: 0% | Generating Maze...")

    userX = 0;
    userY = 0;

    $("#win-play-again").fadeOut();

    if (inactivityChecker) {
        clearTimeout(inactivityChecker);
    }

    complete = false;

    /* Delete all duplicate canvas(es) inside element
    var canvasWrapper = document.getElementById("canvas2-wrapper");

    while (canvasWrapper.firstChild) {
        canvasWrapper.removeChild(canvasWrapper.firstChild);
    }*/

    $("#disconnect-message").fadeOut();
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

    if (myp25 == null) {
        myp25 = new p5(mazeDisplay, "canvas2-wrapper");
    }
});

socket.on("completeGeneration", function(data) {
    $("#opponent-progress").text("Opponent Progress: 0% | Race!!!")
});

socket.on("winner", function(data) {
    userX = 0;
    userY = 0;

    gamecomplete = true;

    $("#playing-against").fadeOut();
    $("#canvas2-wrapper").fadeOut();
    $("#play").fadeOut();
    $("#opponent-progress").fadeOut();
    $("#play-again").fadeOut();

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
        $("#score-streak").text("Win Streak: " + data[2]);
    } else {
        console.log("You lost the match.");

        $("#lose-message").fadeIn();

        $("#score-streak").text("Win Streak: " + data[2]);
        $("#play").fadeIn();
    }

    maze = undefined;
    current = undefined;
    userPosition = undefined;

    clearTimeout(inactivityChecker);
});

socket.on("initialMaze", function(data) {
    maze = data;
});

socket.on("modifyCell", function(data) {
    current = data;

    if (maze) {
        maze.cellGraph[current.row][current.column] = current;
        maze.cellGraph[current.row][current.column].visited = false;
    }
});

socket.on("complete", function(data) {
    complete = true;
    inactivityChecker = setTimeout(inactivity, 30000);

    solution = solve(maze);
    console.log(solution.length);
    solved = true;
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