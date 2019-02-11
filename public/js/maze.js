// Note to self: JavaScript variables have function scope, not block scope

var numIterations = 0; // Just for debugging purposes (stop at 1000 iterations otherwise the program goes into
// an infinite loop

// The directions and vectors arrays correspond to each other
// For example, the first element of directions is "N" and the first element of vectors also represents a 
// north vector
var directions = ["N", "E", "S", "W"]

var vectors = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

var wallList = {}; // Structure of a wall [rol (num), col (num), direction (string)]

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

function getRandomPos(widthCells, heightCells) {
    var row = Math.floor(Math.random() * heightCells); // Generate a random row
    var column = Math.floor(Math.random() * widthCells); // Generate a random column

    return [row, column];
}

var mazeIntro = function (p) {

    var maze = new Maze(23, 35); // Generate a new maze with 20 rows and 35 columns

    Maze.prototype.createMaze = function () { // Build an empty maze
        for (var i = 0; i < this.numRows; i++) { // Iterate through every row
            for (var j = 0; j < this.numColumns; j++) { // Iterate through every column
                var cell = new Cell(20, i, j); // Create a new size at row i and column j with size 20
                maze.cellGraph[i].push(cell); // Add the cell to the row
            }
        }
    }

    maze.createMaze(); // Build the maze

    p.setup = function () {
        var canvas = p.createCanvas(700, 460);
        p.background(255, 255, 255);

        p.smooth();
        p.noLoop();

        // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
        var pos = getRandomPos(maze.cellGraph[0].length, maze.cellGraph.length);
;
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
        /*
            For each wall:
            1. Check if it is on the border of the maze:
            2. If it is on the border: don't draw the wall
            3. If it isn't on the border: draw the wall
        */

        p.stroke(255, 255, 255);
        if (this.walls[0] && this.row != 0) { // Top
            p.line(this.xPos, this.yPos, this.xPos + this.cellSize, this.yPos);
        }
        if (this.walls[1] && this.column != maze.widthCells - 1) { // Right
            p.line(this.xPos + this.cellSize, this.yPos, this.xPos + this.cellSize, this.yPos + this.cellSize);
        }
        if (this.walls[2] && this.row != maze.heightCells - 1) { // Bottom
            p.line(this.xPos + this.cellSize, this.yPos + this.cellSize, this.xPos, this.yPos + this.cellSize);
        }
        if (this.walls[3] && this.column != 0) { // Left
            p.line(this.xPos, this.yPos + this.cellSize, this.xPos, this.yPos);
        }

        p.noStroke();
    }

    Cell.prototype.toString = function () {
        /*
            Mainly used for debugging purposes, converts the object into a string containing the row and the column of the cell
        */
        return this.row + "|" + this.column;
    }

    function deleteWall(current, neighbor) {
        /*
            Deletes two walls separating two cells: current and neighbor

            Calculates if neighbor is to the left, right, top, or bottom of cell
            Removes the current's wall and the corresponding neighbor's wall
        */
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

    function calculateCellDivision(wall) {
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

        if (cell2Row < 0 || cell2Row >= maze.cellGraph.length || cell2Column < 0 || cell2 >= maze.cellGraph[0].length) {
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

    function getCellWalls(row, col) {
        // Gets a cell's walls
        var cellWalls = [];

        for (var i = 0; i < directions.length; i++) {
            cellWalls.push(row + col + directions[i]);
        }

        return cellWalls;
    }

    p.draw = function () {
        while (Object.keys(wallList).length > 0) { // While there are still walls in the list
            
            // Pick a random wall of the list
            var wallListKeys = $.map(wallList, function (value, key) {
                return key;
            });


            var randomKey = wallListKeys[Math.floor(Math.random() * wallListKeys.length)];

            var randomWall = wallList[randomKey];

            var components = calculateCellDivision(randomWall);

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

                    var unvisitedCell = maze.cellGraph[components[3].row][components[3].column];
                    unvisitedCell.visited = true;

                    var unvisitedString = unvisitedCell.row + "|" + unvisitedCell.column;

                    // Add the neighboring walls of the cell to the wall list
                    // Format of the walls (by index):
                    // 0 = top, 1 = right, 2 = bottom, 3 = left
                    var computedFrontierWalls = maze.computeFrontierWalls(unvisitedCell.row, unvisitedCell.column);

                    for (var k = 0; k < computedFrontierWalls.length; k++) {
                        var computedWall = computedFrontierWalls[k];
                        var keyString = computedWall[0].toString() + computedWall[1].toString() + computedWall[2];

                        if (!wallList[keyString]) {
                            wallList[keyString] = computedWall;
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

            delete wallList[randomKey];
            delete wallList[correspondingString];
        }

        p.clear();

        // Draw the maze
        for (var i = 0; i < maze.cellGraph.length; i++) { // Iterate through row
            for (var j = 0; j < maze.cellGraph[i].length; j++) { // Iterate through every column
                maze.cellGraph[i][j].display(); // Display the cell
            }
        }
    }
};

var myp5 = new p5(mazeIntro, "canvas-wrapper"); // Initialize the graphics engine for the canvas