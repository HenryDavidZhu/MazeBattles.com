var difficulties = ["easy", "medium", "hard", "expert"]; // List of all the different maze difficulties
var difficultyDimensions = {"easy":[29, 44], "medium":[31, 47], "hard":[34,51], "expert":[36,56]}
var cellSizes = {"easy":16, "medium":15, "hard":14, "expert":13}; // The sizes of the cells corresponding to the maze's difficulty
var difficultyIndex = 0;

var maze;
var mazeComplete = false; // Whether the maze generation process has finished or not
var solved = false; // Whether the maze has been solved (or the user lost) or not
var option = "single-player";

var timerStarted = false;
var timer = new Timer();

var playerPosition; // The cell object the user is positioned at
var playerX = 0;
var playerY = 0;

var initialized = false; // Whether the maze has already been created or not

var singlePlayerPath = ["0-0"];
var path = [];

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

$("select").change(function() {
	option = $(this).val();

	if (option == "one-on-one") {
		//$("#mode-select").val("one-on-one");
		$("#menu-1").css({"display":"none"});
		$("#menu-2").css({"display":"inline"});
	} 

	if (option == "single-player") {
		//$("#mode-select").val("single-player");
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
	    var mazeDifficulty = difficulties[difficultyIndex];
	    var dimensions = difficultyDimensions[mazeDifficulty];
	    var maze = new Maze(dimensions[0], dimensions[1], cellSizes[mazeDifficulty]);
	    maze.createMaze();	
	    maze.generateMaze();
	    socket.emit("invite", [maze, mazeDifficulty]);	
}

$(".invite").click(function() {
	console.log("invite button clicked");
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

	if (codeLength == 0) {
		alert("Please enter a code.");
	} else {
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
	
	maze = new Maze(dimensions[0], dimensions[1], cellSizes[mazeDifficulty]);
	maze.createMaze();
	maze.generateMaze();

	displayTab(6, 6); 
	myp5 = new p5(mazeDisplay, "canvas2-wrapper");

	$("#time-elapsed").css({"display":"inline"});

	mazeComplete = true;

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