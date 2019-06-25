var printed = false; // For debugging purposes only (REMOVE)

var directions = ["N", "E", "S", "W"];
var vectors = [
    [-1, 0], // N vector
    [0, 1], // E vector
    [1, 0], // S vector
    [0, -1] // W vector
];
var openPairings = [ // [cellA, cellB] - A list of possible combinations of open walls between two cells
    [0, 2],
    [1, 3],
    [2, 0],
    [3, 1]
]

function isWall(cellA, cellB) { // Sees if there's a wall between two cells
    for (var i = 0; i < openPairings.length; i++) {
        var pairing = openPairings[i];

        if (!cellA.walls[pairing[0]] && !cellA.walls[pairing[1]]) // Check if the correct walls from both cells are open
            return true;
    }

    return false;
}

function Maze(numRows, numColumns, cellSize) {
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.numCells = numRows * numColumns;
    this.cellGraph = [];
    this.wallList = {};
    this.cellSize = cellSize;

    this.mazeWidth = this.numColumns * this.cellSize;
    this.mazeHeight = this.numRows * this.cellSize;

    this.path = []; // The solution to the maze

    for (var i = 0; i < numRows; i++) { // For every single row
        this.cellGraph.push([]); // Start out with an empty row
    }

    this.endString = (numRows - 1) + "-" + (numColumns - 1);
}

Maze.prototype.createMaze = function() {
    for (var i = 0; i < this.numRows; i++) {
        for (var j = 0; j < this.numColumns; j++) {
            var cell = new Cell(this.cellSize, i, j);
            this.cellGraph[i].push(cell);
        }
    }
}

Maze.prototype.computeFrontierWalls = function(cellRow, cellColumn) {
    /*
    Frontier walls are all the walls of the adjacent cells.
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

    var computedFrontier = [];
    var originalCell = this.cellGraph[cellRow][cellColumn];

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

Maze.prototype.getRandomPos = function() {
    return [Math.floor(Math.random() * this.numRows), Math.floor(Math.random() * this.numColumns)];
}

Maze.prototype.BFS = function(startR, startC) {
    // startR = the starting row of the cell to traverse from
    // startC = the starting column of the cell to traverse from
    var cellQueue = new Queue();
    var prev = {};

    var rootCell = this.cellGraph[startR][startC];
    rootCell.BFSvisited = true;
    cellQueue.enqueue(this.cellGraph[startR][startC]);

    while (!cellQueue.isEmpty()) {
        var cellToSearch = cellQueue.dequeue();

        //console.log("-----------------------------------------------");
        console.log("dequeuing " + cellToSearch.toString() + " from cellQueue");

        // Get cellToSearch's neighbors
        var neighbors = cellToSearch.getNeighbors();
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            console.log("neighbor " + i + ": " + neighbor.toString());

            if (!neighbor.BFSvisited) {
                cellQueue.enqueue(neighbor);
                neighbor.BFSvisited = true;
                prev[neighbor.toString()] = cellToSearch.toString();
            }
        }

        if (cellToSearch.row == this.numRows - 1 && cellToSearch.column == this.numColumns - 1) {
            break;
        }
    }

    // The below 3 lines for debugging purposes ONLY
    console.log(prev);

    this.path = []; // initialize the solution path
    var current = this.cellGraph[this.numRows - 1][this.numColumns - 1];
    //console.log("current.toString() = " + current.toString() + ", current.row = " + current.row + ", current.column = " + current.column);
    var previous = prev[current.toString()];

    while (current != null) {
        if (current.row == 0 && current.column == 0) {
            break;
        }

        this.path.push(current.toString());
        current = prev[current.toString()];
    }
}

Maze.prototype.findSolution = function() {
    console.log("Finding solution to maze.");
    this.BFS(0, 0); // Start searching for the solution from the user's starting point
    console.log(path);
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

function Cell(cellSize, row, column) {
    this.cellSize = cellSize; // The width and height of the cell

    this.column = column;
    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;

    this.walls = [true, true, true, true]; // 0 = top, 1 = right, 2 = bottom, 3 = left
    this.visited = false; // Whether the cell has been traversed or not
    this.BFSvisited = false; // Whether the cell has been traversed by the BFS generator
}

Cell.prototype.highlight = function() {
    p.noFill();
    p.stroke("#ffffff");
    p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
    p.fill(98, 244, 88);
}

Cell.prototype.getNeighbors = function() {
    var neighbors = [];

    for (var i = 0; i < vectors.length; i++) {
        var vector = vectors[i];
        
        if (!this.walls[i]) {
            neighbors.push(maze.cellGraph[parseInt(this.row + vector[0])][parseInt(this.column + vector[1])]);     
        }  
    }

    return neighbors;
}

Cell.prototype.toString = function() {
    return this.row + "-" + this.column;
}

// Graphics controller
var mazeDisplay = function(p) {
    if (maze) {
        p.setup = function() {
            var canvas = p.createCanvas(maze.mazeWidth, maze.mazeHeight);
            p.background(0, 0, 0);

            // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
            var pos = maze.getRandomPos();

            var row = pos[0];
            var column = pos[1];

            maze.cellGraph[row][column].visited = true;

            for (var k = 0; k < directions.length; k++) {
                var key = row.toString() + column.toString() + directions[k].toString();

                if (!maze.wallList[key]) {
                    maze.wallList[key] = [row, column, directions[k]];
                }
            }

            playerPosition = maze.cellGraph[0][0];
        }

        Cell.prototype.display = function() {
            p.stroke(255, 255, 255);
            if (this.walls[0] && this.row != 0) { // Top
                p.line(this.xPos, this.yPos, this.xPos + this.cellSize, this.yPos);
            }
            if (this.walls[1] && this.column != playerPosition.widthCells - 1) { // Right
                p.line(this.xPos + this.cellSize, this.yPos, this.xPos + this.cellSize, this.yPos + this.cellSize);
            }
            if (this.walls[2] && this.row != playerPosition.heightCells - 1) { // Bottom
                p.line(this.xPos + this.cellSize, this.yPos + this.cellSize, this.xPos, this.yPos + this.cellSize);
            }
            if (this.walls[3] && this.column != 0) { // Left
                p.line(this.xPos, this.yPos + this.cellSize, this.xPos, this.yPos);
            }
            p.noStroke();
        }

        p.displayMaze = function(maze) {
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

        p.draw = function() {
            if (option == "single-player" || option == "one-on-one") {
                p.clear();

                p.displayMaze(maze);

                // Change the generating maze text
                if (!timerStarted) {
                    $("#game-panel").fadeOut(500, function() {
                        // Change the html of the score-panel to the play again button
                        $("#game-panel").html("time elapsed: 0:00");

                        $("#game-panel").fadeIn(500, function() {

                        });
                    });

                    timer.reset();
                    timer.start();
                    timer.addEventListener("secondsUpdated", updateTime);

                    timerStarted = true;
                }

                playerPosition = maze.cellGraph[playerRow][playerCol];

                p.fill(98, 244, 88);
                p.ellipse(playerPosition.xPos + playerPosition.cellSize / 2, playerPosition.yPos + playerPosition.cellSize / 2, playerPosition.cellSize / 2, playerPosition.cellSize / 2);
                
                if (!solved) {
                    drawPath(p, path);
                }
                if (solved) {
                    if (!printed) {
                        console.log(maze.path);
                        printed = true;
                    }
                    drawPath(p, maze.path);
                }
            }
        }


        //if (maze.initialized != true) {
        if (!initialized) {

            p.keyTyped = function() {
                if (!solved) {
                    if (p.key === 'a' || p.key === 'A' || p.key === 'w' || p.key === 'W' || p.key === 'd' || p.key === 'D' || p.key === 's' || p.key === 'S') {
                        movementController(p.key);
                    }
                }
            }
        }
    }
};

function movementController(key) {
    // Controls all the logic behind the user's movement on the board
    var cellString = "";

    if (key === 'w' || key === 'W') {
        if (playerPosition && !playerPosition.walls[0]) {
            playerRow -= 1;

            cellString = playerRow + "-" + playerCol;

            if (path.indexOf(cellString) == -1) {
                path.push(cellString);
            } else if (cellString == "0-0") {
                path = ["0-0"];
            } else {
                path.pop();
            }
        }
    }

    if (key === 's' || key === 'S') {
        if (playerPosition && !playerPosition.walls[2]) {
            playerRow += 1;

            cellString = playerRow + "-" + playerCol;

            if (path.indexOf(cellString) == -1) {
                path.push(cellString);
            } else if (cellString == "0-0") {
                path = ["0-0"];
            } else {
                path.pop();
            }
        }
    }

    if (key === 'a' || key === 'A') {
        if (playerPosition && !playerPosition.walls[3]) {
            playerCol -= 1;

            cellString = playerRow + "-" + playerCol;

            if (path.indexOf(cellString) == -1) {
                path.push(cellString);
            } else if (cellString == "0-0") {
                path = ["0-0"];
            } else {
                path.pop();
            }
        }
    }

    if (key === 'd' || key === 'D') {
        if (playerPosition && !playerPosition.walls[1]) {
            playerCol += 1;

            cellString = playerRow + "-" + playerCol;

            if (path.indexOf(cellString) == -1) {
                path.push(cellString);
            } else if (cellString == "0-0") {
                path = ["0-0"];
            } else {
                path.pop();
            }
        }
    }

    if (cellString == maze.endString) {
        solved = true;
        timer.stop();
        var timeText = $("#time-span").html();

        if (option == "single-player") {
            $("#time-elapsed").html("You solved the maze in " + timeText + " / <button id=\"play-again\" onclick=\"window.location.href='http://www.mazebattles.com'\">Play Again</button>");
        }

        if (option == "one-on-one") {
            $("#time-elapsed").html("You solved the maze in " + timeText + " / <button id=\"rematch\" onclick=\"rematch()\">Rematch</button> / <button id=\"quit\"  onclick=\"window.location.href='http://www.mazebattles.com'\">Quit</button>");
            socket.emit("winner", roomID);
        }
    }

    return;
}