var socket = io.connect();

function connectUser() {
	socket.emit("user-connected", true); // Playing as a guest
}
