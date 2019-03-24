
var mqtt = require('mqtt')

module.exports = class {
  static init (url, cb) {
    this.client = mqtt.connect(url)
    this.client.on('connect', _ => cb(this.client))
  }
}
