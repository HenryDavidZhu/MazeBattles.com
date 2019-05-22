var roomID;
var myp5;

socket.on("generated-url", createRoom);

function createRoom(id) {
    roomID = id;

    $("#invite-menu").html("share this code with your friend: <span class='code'>" + roomID +
        "</span><br><b>stay on this page</b>. you will be automatically paired once your friend joins.");
}

socket.on("invalid", alertError); // When the user entered a room code that does not exist

function alertError() {
    alert("The code you entered is invalid.");
}

socket.on("maze", downloadMaze);

function downloadMaze(newMaze) {
	maze = newMaze[0];
}

socket.on("paired", initializedGame);

function initializedGame(room, initialized) {
	// initialized: whether the user has already played a match
	// room: the id of the room the user has just joined
	roomID = room;

	if (!initialized) {
		displayTab(6, 6); 
		myp5 = new p5(mazeDisplay, "canvas2-wrapper");
	}
}

// Graphics controller
var mazeDisplay = function (p) {
    p.setup = function () {
        var canvas = p.createCanvas(705, 465);
        p.background(0, 0, 0);

        // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list
        console.log(maze.cellGraph);
        var pos = maze.getRandomPos();
        
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
        p.stroke(255, 255, 255);
        if (this.walls[0] && this.row != 0) { // Top
            p.line(this.xPos, this.yPos, this.xPos + this.cellSize, this.yPos);
        }
        if (this.walls[1] && this.column != singlePlayerCurrent.widthCells - 1) { // Right
            p.line(this.xPos + this.cellSize, this.yPos, this.xPos + this.cellSize, this.yPos + this.cellSize);
        }
        if (this.walls[2] && this.row != singlePlayerCurrent.heightCells - 1) { // Bottom
            p.line(this.xPos + this.cellSize, this.yPos + this.cellSize, this.xPos, this.yPos + this.cellSize);
        }
        if (this.walls[3] && this.column != 0) { // Left
            p.line(this.xPos, this.yPos + this.cellSize, this.xPos, this.yPos);
        }
        p.noStroke();
    }

    p.displayMaze = function (maze) {
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

    Cell.prototype.highlight = function () {
        p.noFill();
        p.stroke("#ffffff");
        p.ellipse(this.xPos + this.cellSize / 2, this.yPos + this.cellSize / 2, this.cellSize / 2, this.cellSize / 2);
        p.fill(98, 244, 88);
    }

    p.draw = function () {
        if (mode == "one-on-one") {
            if (!gameOverTrigger) {

                if (maze) {
                    p.clear();
                    p.displayMaze(maze);

                    userPosition = maze.cellGraph[userY][userX];

                    p.fill(98, 244, 88);
                    p.ellipse(userPosition.xPos + userPosition.cellSize / 2, userPosition.yPos + userPosition.cellSize / 2, userPosition.cellSize / 2, userPosition.cellSize / 2);

                    // Draw the path
                    drawPath(p, path);

                    p.ellipse(maze.numColumns * 15 - 7.5, maze.numRows * 15 - 7.5, 5, 5);
                }
            }

            if (gameOver) {
                gameOverTrigger = true;
            }
        }

        if (mode == "single-player") {
            p.clear();

            // Draw the maze
            for (var i = 0; i < maze.cellGraph.length; i++) { // Iterate through row
                for (var j = 0; j < maze.cellGraph[i].length; j++) { // Iterate through every column
                    maze.cellGraph[i][j].display(); // Display the cell
                }
            }

            // Change the generating maze text
            if (!singlePlayerTimeElapsedFadeIn) {
                $("#game-panel").fadeOut(500, function () {
                    // Change the html of the score-panel to the play again button
                    $("#game-panel").html("time elapsed: 0:00");

                    $("#game-panel").fadeIn(500, function () {

                    });
                });

                timer.reset();
                timer.start();
                timer.addEventListener("secondsUpdated", updateTime);

                singlePlayerTimeElapsedFadeIn = true;
            }

            singlePlayerUserPosition = maze.cellGraph[userY][userX];

            p.fill(98, 244, 88);
            p.ellipse(singlePlayerUserPosition.xPos + singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.yPos + singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.cellSize / 2, singlePlayerUserPosition.cellSize / 2);

            drawPath(p, singlePlayerPath);

            p.ellipse(maze.numColumns * 15 - 7.5, maze.numRows * 15 - 7.5, 5, 5);
        }
    }

    p.keyTyped = function () {

    }
};