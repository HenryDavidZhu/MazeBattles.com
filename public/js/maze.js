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

var mazeIntro = function(p) {
    var current;
    var numVisited = 1;
    var stack = [];
    var solved = false;
    var shortestPath = [];
    var printTimes = 0;
    var solved = false;

    var maze = new Maze(24, 16);

    Maze.prototype.createMaze = function() {
        for (var i = 0; i < this.heightCells; i++) {
            for (var j = 0; j < this.widthCells; j++) {
                var cell = new Cell(25, i, j);
                maze.cellGraph[i].push(cell);
            }
        }
    }

    maze.createMaze();

    p.setup = function() {
        var canvas = p.createCanvas(600, 400);
        p.smooth();
    }

    Cell.prototype.display = function() {
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

    Cell.prototype.getNeighbor = function(dfs) {
        var neighbors = [];
        var coordinates = [];

        if (this.column > 0) {
            var neighbor = maze.cellGraph[this.row][this.column - 1];

            if (dfs) {
                if (!neighbor.visited) {
                    coordinates.push([this.row, this.column - 1]);
                    neighbors.push(neighbor);
                }
            } else {
                if (!isWall(this, neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        if (this.column < maze.widthCells - 1) {
            var neighbor = maze.cellGraph[this.row][this.column + 1];

            if (dfs) {
                if (!neighbor.visited) {
                    coordinates.push([this.row, this.column + 1]);
                    neighbors.push(neighbor);
                }
            } else {
                if (!isWall(this, neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        if (this.row > 0) {
            var neighbor = maze.cellGraph[this.row - 1][this.column];

            if (dfs) {
                if (!neighbor.visited) {
                    coordinates.push([this.row - 1, this.column]);
                    neighbors.push(neighbor);
                }
            } else {
                if (!isWall(this, neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }
        if (this.row < maze.heightCells - 1) {
            var neighbor = maze.cellGraph[this.row + 1][this.column];   

            if (dfs) {
                if (!neighbor.visited) {
                    coordinates.push([this.row + 1, this.column]);
                    neighbors.push(neighbor);
                }
            } else {
                if (!isWall(this, neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }

        if (dfs) {
            if (neighbors.length > 0) {
                var randomIndex = Math.floor(Math.random() * neighbors.length);
                var randomNeighbor = neighbors[randomIndex];
                return randomNeighbor;
            } else {
                return undefined;
            }
        } else {
            return neighbors;
        }
    }

    Cell.prototype.highlight = function() {
        p.noFill();
        p.stroke(98, 244, 88);
        p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
        p.fill(255, 255, 255);
    }

    Cell.prototype.mark = function() {
        p.fill(98, 244, 88);
        p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
    }

    Cell.prototype.toString = function() {
        return this.row + "|" + this.column;
    }

    function deleteWall(current, neighbor) {
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

    current = maze.cellGraph[0][0];
    current.visited = true;

    function equalCells(cell1, cell2) {
        return cell1.row == cell2.row && cell1.column == cell2.column;
    }

    function breadthFirstSearch(pointA, pointB) { // Use Breadth First Search
        var queue = [];
        var visited = [];
        var path = [];
        queue.push(pointA);

        while (true) {
        	var current = queue.shift();
        	visited.push(current.toString());
        	path.push(current.toString());

        	if (equalCells(current, pointB)) {
        		break;
        	}

        	var neighbors = current.getNeighbor(false);

        	for (var i = 0; i < neighbors.length; i++) {
        		var neighbor = neighbors[i];

        		if (visited.indexOf(neighbor.toString()) == -1) {
        			visited.push(neighbor.toString());
        			queue.push(neighbor);
        		}
        	}
        }

        return path;
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

    p.draw = function() {
        p.clear();
        for (var i = 0; i < maze.cellGraph.length; i++) {
            for (var j = 0; j < maze.cellGraph[i].length; j++) {
                maze.cellGraph[i][j].display();
            }
        }

        p.line(0, 400, 400, 400);

        if (numVisited < maze.numCells) {
            var neighbor = current.getNeighbor(true);

            if (neighbor && !neighbor.visited) {
                neighbor.visited = true;

                // Draw a dot to indicate that the neighbor has been visited

                stack.push(current);
                deleteWall(neighbor, current);
                current = neighbor;
                numVisited += 1;
            } else if (stack.length > 0) {
                current = stack.pop();
            }
            current.highlight();
        } else {
            maze.cellGraph[0][0].mark();
            //maze.cellGraph[maze.heightCells - 1][maze.widthCells - 1].highlight();
        }
    }
};

var myp5 = new p5(mazeIntro, "canvas-wrapper");
