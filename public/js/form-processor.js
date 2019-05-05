$("#mode-select").change(function() {
	var option = $(this).val(); // Get the mode the user selected

	if (option == "one-on-one") {
		$("#menu-1").hide();
		$("#menu-3").hide();
		$("#menu-4").hide();
		$("#menu-2").show();

		mode = "one-on-one";
	}

	if (option == "single-player") {
		$("#menu-2").hide();
		$("#menu-3").hide();
		$("#menu-4").hide();
		$("#menu-1").show();

		mode = "single-player";
	}
});

$("#invite").click(function() {
    // Show the maze difficulty menu
    $("#menu-1").hide();
    $("#menu-2").hide();
    $("#menu-4").hide();
    $("#menu-3").show();
});

$("#join").click(function() {
    // Show the room code input
    $("#menu-1").hide();
    $("#menu-2").hide();
    $("#menu-3").hide();
    $("#menu-4").show();
})

// Maze difficulty events
$(".option").click(function() {
	difficulty = jQuery(this).attr("id");

	initSinglePlayer();
});