const Room = require('colyseus').Room;

const TURN_TIMEOUT = 10

module.exports = class TicTacToe extends Room {

  onInit () {
    this.maxClients = 2;

    this.setState({
      maze: null,
      players: {},
      player1Pos: [0, 0],
      player2Pos: [0, 0]
    })
  }

  onJoin (client) {
  }

  onMessage (client, data) {
  }

  onLeave (client) {
  }

}