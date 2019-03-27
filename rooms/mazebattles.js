const Room = require('colyseus').Room;

const TURN_TIMEOUT = 10

module.exports = class TicTacToe extends Room {

  onInit () {
    this.maxClients = 2;
    this.endPosition = [22, 34];

    this.setState({
      maze: null,
      players: [] // Maps the client's id to its position in the maze
    })
  }

  onJoin (client) {
    this.state.players[client.sessionID] = [0, 0];

    console.log("this.players.length = " + this.players.length);

    if (this.players.length == this.maxClients) {
      // Lock this room for new users
      this.lock();
    }
  }

  onMessage (client, data) {
    // Receives position from the client
    this.state.players[client.sessionID] = data;

    // Analyze if the client has won based on his or her position
    if (data[0] == this.endPosition[0] && data[1] == this.endPosition[1]) {
    
    }
  }

  onLeave (client) {
  }

}