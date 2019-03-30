// MAZE LOGIC
function Maze(widthCells, heightCells) {
    this.widthCells = widthCells;
    this.heightCells = heightCells;

    this.numCells = widthCells * heightCells;

    this.cellGraph = []; // 2-Dimensioanl Array that stores all the cells in the maze

    for (var i = 0; i < heightCells; i++) { // Iterate through each row in the array
        this.cellGraph.push([]); // Add a new empty row to the array
    }
}

function Cell(cellSize, row, column) {
    this.cellSize = cellSize;
    this.column = column;

    this.row = row;

    this.xPos = column * cellSize;
    this.yPos = row * cellSize;

    this.walls = [true, true, true, true]; // bottom, left, top, right

    this.visited = false; // Has the cell been visited by the maze generator
    this.marked = false; // Has the cell been visited by the maze solver
}

Cell.prototype.getNumWalls = function () {
    // Function that gets the number of walls surrounding the cell

    var numWalls = 0;

    for (var i = 0; i < this.walls.length; i++) { // Iterate through each wall
        if (this.walls[i]) { // Check if a wall is present
            numWalls += 1;
        }
    }

    return numWalls;
}

Maze.prototype.getNeighbor = function (dfs, cellRow, cellColumn) { // Get all of the neighbors of a specific cell in the maze
    var neighbors = []; // The list of all the neighbors of that cell
    var coordinates = []; // The list of the coordinates of the neighbors of that cell

    if (cellColumn > 0) { // If the cell isn't on the left side, there is a neighbor to the left
        var neighbor = this.cellGraph[cellRow][cellColumn - 1]; // Get the neighboring cell to the left

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
    if (cellColumn < this.widthCells - 1) { // If the cell isn't on the right side, there is a neighbor to the right
        var neighbor = this.cellGraph[cellRow][cellColumn + 1]; // Get the neighboring cell to the right

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
        var neighbor = this.cellGraph[cellRow - 1][cellColumn]; // Get the neighboring cell to the top

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
    if (cellRow < this.heightCells - 1) { // If the cell isn't on the bottom side, there is a neighbor to the bottom
        var neighbor = this.cellGraph[cellRow + 1][cellColumn]; // Get the neighboring cell to the bottom

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

function deleteWall(current, neighbor) { // Delete the wall between two cells
    var deltaX = current.column - neighbor.column; // Get the x distance between the two cells
    var deltaY = current.row - neighbor.row; // Get the y distance between the two cells

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

function equalCells(cell1, cell2) {
    return cell1.row == cell2.row && cell1.column == cell2.column;
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

Maze.prototype.createMaze = function () {
    for (var i = 0; i < this.heightCells; i++) {
        for (var j = 0; j < this.widthCells; j++) {
            var cell = new Cell(20, i, j);
            this.cellGraph[i].push(cell);
        }
    }
}






// NETWORKING LOGIC
const Room = require('colyseus').Room;

const TURN_TIMEOUT = 10

module.exports = class MazeRoom extends Room {

  onInit () {
    this.maxClients = 2;
    this.endPosition = [22, 34];

    this.maze = new Maze(35, 20);
    this.maze.createMaze();

    console.log("initializing maze");

    this.setState({
      maze: this.maze,
      players: [] // Maps the client's id to its position in the maze
    })
  }

  onJoin (client) {

    console.log("this.players.length = " + this.players.length);

    // Emit the newly created maze to the client
    

    if (this.players.length == this.maxClients) {
      // Lock this room for new users
      //this.lock();
    }
  }

  onMessage (client, data) {
    // Receives position from the client
    console.log("this.state = " + this.state);
    this.state.players[client.sessionID] = data;

    // Analyze if the client has won based on his or her position
    if (data[0] == this.endPosition[0] && data[1] == this.endPosition[1]) {
    
    }
  }

  onLeave (client) {
      delete this.state.players[client.sessionID];

      var winningPlayer = Object.keys(this.state.players)[0];

      
  }

}