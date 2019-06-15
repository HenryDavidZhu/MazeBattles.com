var roomID; 
var myp5; // Instance of the p5.js graphics engine
var timerStarted = false; 

socket.on("generated-url", createRoom); // Server finishes creating room, notifies client of the room code

function createRoom(id) { 
    roomID = id; // Download the room id

    $("#url-menu").html("share this code with your friend: <span class='code'>" + roomID +
        "</span><br><b>stay on this page</b>. you will be automatically paired once your friend joins.");
    $(".one-on-one-menu").hide();
    $("#url-menu").show();
}

socket.on("invalid", alertError); // When the user entered a room code that does not exist

function alertError() {
    alert("The code you entered is invalid.");
}

socket.on("maze", downloadMaze); // Client-side (opponent) finishes generating maze, sends that maze to the server, and the server sends that maze to
// this client to download 
	
function downloadMaze(newMaze) { // newMaze: [(Maze) Object, maze's cell size]
	var mazeToCopy = newMaze[0]; 
	var cellSize = cellSizes[newMaze[1]];

	maze = new Maze(mazeToCopy.numRows, mazeToCopy.numColumns, cellSize); // Construct a new maze based on the dimension properties of the maze passed in
	maze.cellGraph = mazeToCopy.cellGraph; // Download the maze's cell graph

	path = ["0-0"]; // Reset the path: the user always starts at the top left corner
	solved = false; // Initially, the maze is not solved

	// The player starts in the top left corner of the maze
	playerPosition = maze.cellGraph[0][0]; 
	playerRow = 0;
	playerCol = 0;
	
}

socket.on("paired", initializedGame) // When the user has been paired in a match with another player

function initializedGame(room) {
	roomID = room; // Download the room ID

	// When the user plays a rematch, remove any existing canvases inside canvas2-wrapper to prevent duplicate canvases
	var canvasWrapper = document.getElementById("canvas2-wrapper");
	while (canvasWrapper.firstChild) {
		canvasWrapper.removeChild(canvasWrapper.firstChild);
	}
	
	displayTab(3, 3); // display the game menu

	myp5 = new p5(mazeDisplay, "canvas2-wrapper"); // Initialize the game's graphics engine
	
	mazeComplete = true; // The maze has finished generating

	$("#time-elapsed").show(); // Show the timer 

	timer.reset();
	timer.start();
	timer.addEventListener("secondsUpdated", updateTime); // Update the timer every second
}

function updateTime() {
    if (mazeComplete) { // Only update the time if the maze has finished generating
        $("#time-elapsed").html("time elapsed: <span id=\"time-span\">" + timer.getTimeValues().toString(["minutes", "seconds"]) + "</span>");
    }
}

function drawPath(p, path) { // Draws the path on a canvas given an array of the player's coordinates (path)
    if (path.length >= 1) {
        p.strokeWeight(2); // How thick the path is
        p.stroke(98, 244, 88); // Light green color

        var prev = path[0]; // The previous cell on the user's path

        var components = prev.split("-");
        var prevRow = parseInt(components[0]);
        var prevColumn = parseInt(components[1]);

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
	$("#time-elapsed").html("Waiting for your opponent to accept your rematch request.");
	socket.emit("rematch", roomID); // Send a rematch request to the server with the roomID
}

socket.on("lost", handleLoss);

function handleLoss() {
	solved = true; // The current match is no longer in session
	timer.stop(); 

	$("#time-elapsed").html("Your opponent won the match. /  <button id=\"rematch\" onclick=\"rematch()\">Rematch</button> / <button id=\"quit\"  onclick=\"window.location.href='http://www.mazebattles.com'\">Quit</button>")
}

socket.on("disconnectedUser", opponentDisconnect);

function alertOpponentDisconnect() {
	alert("Your opponent disconnected from the match");
}

function redirectUser() {
	window.location.href = "http://www.mazebattles.com"; // Redirect the user to the main page
}

function opponentDisconnect() {
	// For some reason, without a callback function, the user is redirected before alerted that the opponent disconnected from the match.
	$.ajax({
		url: alertOpponentDisconnect(), // Alert the user first
		success: function() {
			redirectUser(); // Then redirect the user
		}
	})
}

function acceptRematch(accept) {
	if (accept) {
		$("#time-elapsed").html("setting up match room...");

		// Construct the maze based on the given dimensions
		maze = new Maze(maze.numRows, maze.numColumns, maze.cellSize); 
		maze.createMaze();

		maze.generateMaze(); // Generate the maze

		path = ["0-0"]; // Reset the path (the user starts at the top left corner)
		solved = false;
		playerPosition = maze.cellGraph[0][0]; // Reset the user position (user starts at the top left corner)

		socket.emit("acceptRematch", maze, roomID);
	}
	if (!accept) { // If the user doesn't accept the rematch
		redirectUser(); // Redirect the user to the main page (the disconnect event on the server-side will )
	}
}

socket.on("rematchrequest", rematchRequest);

function rematchRequest() {
	alert("Your opponent has requested a rematch");
	$("#time-elapsed").html("<button onclick=\"acceptRematch(true)\">Accept</button>&nbsp;<button onclick=\"acceptRematch(false)\">Decline</button>")
}