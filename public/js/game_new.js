socket.on("generated-url", createRoom);

function createRoom(id) {
    console.log("created room with id " + id);
    roomID = id;

    // Add event listeners to the room
    $("#invite-menu").html("share this code with your friend: <span class='code'>" + roomID +
        "</span><br><b>stay on this page</b>. you will be automatically paired once your friend joins.");
	
}