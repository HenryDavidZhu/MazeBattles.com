function isWall(cellA, cellB) {
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
    this.numColumns = numColumns;
    this.numRows = numRows;
    this.numCells = numRows * numColumns;
    this.cellGraph = [];

    for (var i = 0; i < numRows; i++) { // For every single row
        this.cellGraph.push([]); // Start out with an empty row
    }
}

Maze.prototype.createMaze = function () {
    for (var i = 0; i < this.numRows; i++) {
        for (var j = 0; j < this.numColumns; j++) {
            var cell = new Cell(15, i, j);
            this.cellGraph[i].push(cell);
        }
    }
}

Maze.prototype.computeFrontierWalls = function (cellRow, cellColumn) {
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

function Cell(cellSize, row, column) {
    this.cellSize = cellSize; // The width and height of the cell

    this.column = column;
    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;

    this.walls = [true, true, true, true]; // 0 = top, 1 = right, 2 = bottom, 3 = left
    this.visited = false; // Whether the cell has been traversed or not
}
