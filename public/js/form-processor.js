var difficulties = ["easy", "medium", "hard", "expert"];
var difficultyDimensions = {"easy":[29, 44], "medium":[31, 47], "hard":[34,51], "expert":[36,56]}
var difficultyIndex = 0;

$(".easier").click(function() {
	if (difficultyIndex == 0) {
		difficultyIndex = difficulties.length - 1;
	} else {
		difficultyIndex--;
	}

	changeDifficulty(difficultyIndex);
});

$(".harder").click(function() {
	console.log("harder clicked!");
	if (difficultyIndex == difficulties.length - 1) {
		difficultyIndex = 0;
	} else {
		difficultyIndex++;
	}

	changeDifficulty(difficultyIndex);
});

function changeDifficulty(difficultyIndex) {
	console.log("difficulty = " + difficulty);

	for (var i = 0; i < difficulties.length; i++) {
		var difficulty = difficulties[i];

		if (i == difficultyIndex) {
			console.log("showing " + difficulty);
			$("#" + difficulty).css({"display":"inline"});
		} else {
			console.log("hiding " + difficulty);
			$("#" + difficulty).css({"display":"none"});
		}
	}
}

$("select").change(function() {
	var option = $(this).val();

	if (option == "one-on-one") {
		$("#menu-1").css({"display":"none"});
		$("#menu-2").css({"display":"inline"});
	} 

	if (option == "single-player") {
		$("#menu-2").css({"display":"none"});
		$("#menu-1").css({"display":"inline"});
	}
});

$("#invite").click(function() {
    $("#invite-menu").html("setting up match room<span class=\"dots\"><span class=\"dot\">.</span class=\"dot\"><span>.</span class=\"dot\"><span>.</span></span>");

    var mazeDifficulty = difficulties[difficultyIndex];
    var dimensions = difficultyDimensions[mazeDifficulty];
    var maze = new Maze(dimensions[0], dimensions[1]);
    maze.createMaze();	
    maze.generateMaze();	

    socket.emit("invite", [maze, mazeDifficulty]);
});

$("#join").click(function() {
	$("#invite-menu").hide();
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