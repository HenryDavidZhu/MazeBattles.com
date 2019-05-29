var roomID;
var myp5;
var timerStarted = false;

socket.on("generated-url", createRoom);

function createRoom(id) { 
    roomID = id;

    $("#url-menu").html("share this code with your friend: <span class='code'>" + roomID +
        "</span><br><b>stay on this page</b>. you will be automatically paired once your friend joins.");
    $(".one-on-one-menu").hide();
    $("#url-menu").show();
}

socket.on("invalid", alertError); // When the user entered a room code that does not exist

function alertError() {
    alert("The code you entered is invalid.");
}

socket.on("maze", downloadMaze);

function downloadMaze(newMaze) {
	var mazeToCopy = newMaze[0];
	console.log("difficulty = " + newMaze[1]);
	console.log(mazeToCopy.numRows);
	console.log(mazeToCopy.numColumns);
	var cellSize = cellSizes[newMaze[1]];
	console.log("cellSize = " + cellSize);
	maze = new Maze(mazeToCopy.numRows, mazeToCopy.numColumns, cellSize);
	maze.cellGraph = mazeToCopy.cellGraph;
}

socket.on("paired", initializedGame);

function initializedGame(room, initialized) {
	// initialized: whether the user has already played a match
	// room: the id of the room the user has just joined
	roomID = room;

	if (!initialized) {
		displayTab(6, 6); 
		myp5 = new p5(mazeDisplay, "canvas2-wrapper");

		mazeComplete = true;

		$("#time-elapsed").show();

	    timer.reset();
	    timer.start();
	    timer.addEventListener("secondsUpdated", updateTime);
	}
}

function updateTime() {
	console.log("mazeComplete = " + mazeComplete);
    if (mazeComplete) {
        $("#time-elapsed").html("time elapsed: <span id=\"time-span\">" + timer.getTimeValues().toString(["minutes", "seconds"]) + "</span>");
    }
}

function drawPath(p, path) {
    if (path.length >= 1) {
        p.strokeWeight(2);
        p.stroke(98, 244, 88);

        var prev = path[0];

        var components = prev.split("-");

        var prevRow = parseInt(components[0]);
        var prevColumn = parseInt(components[1]);

        p.line(maze.cellSize / 2, maze.cellSize / 2, column * maze.cellSize + maze.cellSize / 2, row * maze.cellSize + maze.cellSize / 2);

        for (var k = 1; k < path.length; k++) {
            var pathCell = path[k];
            components = pathCell.split("-");
            var row = components[0];
            var column = components[1];

            p.line(prevColumn * maze.cellSize + maze.cellSize / 2, prevRow * maze.cellSize + maze.cellSize / 2, 
            	column * maze.cellSize + maze.cellSize / 2, row * maze.cellSize + maze.cellSize / 2);
            prev = pathCell.split("-");

            prevRow = prev[0];
            prevColumn = prev[1];
        }

        p.strokeWeight(1);
    }
}

function rematch() {
	console.log("rematch function activated");
	$("#time-elapsed").html("Waiting for your opponent to accept your rematch request.");
	socket.emit("rematch", roomID);
}

socket.on("lost", handleLoss);

function handleLoss() {
	alert("You lost!");
	solved = true;
	timer.stop();

	$("#time-elapsed").html("Your opponent won the match. /  <button id=\"rematch\" onclick=\"rematch()\">Rematch</button> / <button id=\"quit\"  onclick=\"window.location.href='http://localhost:3000'\">Quit</button>")
}

socket.on("disconnectedUser", opponentDisconnect);

function alertOpponentDisconnect() {
	alert("Your opponent disconnected from the match");
}

function redirectUser() {
	window.location.href = "http://localhost:3000";
}

function opponentDisconnect() {
	$.ajax({
		url: alertOpponentDisconnect(),
		success: function() {
			redirectUser();
		}
	})
}

function acceptRematch(accept) {
	
}

socket.on("rematchrequest", rematchRequest);

function rematchRequest() {
	alert("Your opponent has requested a rematch");
	$("#time-elapsed").html("<button>Accept</button>&nbsp;<button onclick=\"redirectUser()\">Decline</button>")
}