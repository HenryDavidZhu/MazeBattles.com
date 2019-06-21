var difficulties = ["easy", "medium", "hard", "expert"]; // List of all the different maze difficulties
var difficultyDimensions = {"easy":[29, 44], "medium": [31, 47], "hard": [34,51], "expert": [36,56]} // Sizes of the mazes [row, col] corresponding to the maze difficulty
var cellSizes = {"easy": 16, "medium": 15, "hard": 14, "expert": 13}; // The sizes of the cells corresponding to the maze's difficulty
var difficultyIndex = 0; 

var maze; 
var mazeComplete = false; // Whether the maze generation process has finished or not
var solved = false; // Whether the maze has been solved (or the user lost) or not
var option = "single-player"; // What mode the user is playing in ("single-player" or "one-on-one")

var timerStarted = false; // Whether the 
var timer = new Timer();

var playerPosition; // The cell object the user is positioned at
var playerCol = 0; 
var playerRow = 0;

var initialized = false; // Whether the maze has already been created or not

var path = ["0-0"];

function displayTab(index, maxIndex) {
	// Tab ids are named in the following structure:
	// menu-1, menu-2, menu-3, ... menu-maxIndex
	for (var i = 1; i <= maxIndex; i++) {
		if (i == index) {
			console.log("showing menu-" + i);
			$("#menu-" + i).css({"display":"inline"});
		}
		if (i != index) {
			console.log("hiding menu-" + i);
			$("#menu-" + i).css({"display":"none"})
		}
	}
}	

$(".easier").click(function() {
	if (difficultyIndex == 0) {
		difficultyIndex = difficulties.length - 1;
	} else {
		difficultyIndex--;
	}

	changeDifficulty(difficultyIndex);
});

$(".harder").click(function() {
	if (difficultyIndex == difficulties.length - 1) {
		difficultyIndex = 0;
	} else {
		difficultyIndex++;
	}

	changeDifficulty(difficultyIndex);
});

function changeDifficulty(difficultyIndex) {
	for (var i = 0; i < difficulties.length; i++) {
		var difficulty = difficulties[i];

		if (i == difficultyIndex) {
			$("." + difficulty).show();
		} else {
			$("." + difficulty).hide();
		}
	}
}

$(".mode-select").change(function() {
	option = $(this).val();

	if (option == "one-on-one") {
		$(".mode-select").val("one-on-one");
		console.log("switching to one-on-one mode");
		$("#menu-1").css({"display":"none"});
		$("#menu-2").css({"display":"inline"});
	} 

	if (option == "single-player") {
		$(".mode-select").val("single-player");
		console.log("switching to single-player mode");
		$("#menu-2").css({"display":"none"});
		$("#menu-1").css({"display":"inline"});
	}
});

function displayMatchLoading() {
	/*
		This function is designed to do asyncronous work: for some reason, the maze generation process alwayos
		precedes the command changing the content of the .one-on-one-menu. to "setting up match room..."
	*/
	$(".one-on-one-menu").html("setting up match room<span class=\"dots\"><span class=\"dot\">.</span class=\"dot\"><span>.</span class=\"dot\"><span>.</span></span>");
}

function generateMaze() {
	    var mazeDifficulty = difficulties[difficultyIndex]; // Determine the maze difficulty
	    var dimensions = difficultyDimensions[mazeDifficulty]; // Determine the maze dimensions

	    // Create the maze
	    var maze = new Maze(dimensions[0], dimensions[1], cellSizes[mazeDifficulty]); 
	    maze.createMaze();	
	    maze.generateMaze();

	    socket.emit("invite", [maze, mazeDifficulty]);	
}

$(".invite").click(function() {
	$.ajax({
	   url: displayMatchLoading(),
	   success: function(){
	   		generateMaze();
		}
	})
});

$(".join").click(function() {
	$(".one-on-one-menu").hide();
	$("#url-menu").hide();
	$("#join-menu").show();
});

$("#room-code-form").on("submit", function(e) {
	var roomCode = $("#room-code").val();
	var codeLength = roomCode.length;

	if (codeLength == 0) { // The user entered an empty code
		alert("Please enter a code.");
	} else { // Emit to the server that the user wants to join the room
		socket.emit("join", roomCode);
	}

	e.preventDefault();
});

function displayMazeGenerating() {
	/*
		This function is designed to do asyncronous work: for some reason, the maze generation process alwayos
		precedes the command changing the content of the .one-on-one-menu. to "setting up match room..."
	*/
	$(".single-player-menu").hide();
	$(".loading-msg").show();
}

function initializeSinglePlayer() {
	var mazeDifficulty = difficulties[difficultyIndex]; 
	var dimensions = difficultyDimensions[mazeDifficulty];
	
	// Construct the maze
	maze = new Maze(dimensions[0], dimensions[1], cellSizes[mazeDifficulty]);
	maze.createMaze();
	maze.generateMaze();
	maze.findSolution();

	displayTab(3, 3); 
	myp5 = new p5(mazeDisplay, "canvas2-wrapper"); // Initialize the graphics engine

	$("#time-elapsed").css({"display":"inline"}); // Show the time elapsed menu

	mazeComplete = true; // Maze has finished generated

	// Reset the timer
    timer.reset();
    timer.start();
    timer.addEventListener("secondsUpdated", updateTime);
}


$(".play-button").click(function() {
	$.ajax({
	   url: displayMazeGenerating(),
	   success: function() {
		   initializeSinglePlayer();
		}
	});
});