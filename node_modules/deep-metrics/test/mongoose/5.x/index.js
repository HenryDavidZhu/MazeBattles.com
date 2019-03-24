const mongoose = require('mongoose')

module.exports = class {
  static init (url, cb) {
    mongoose.connect(url)
    let db = mongoose.connection
    db.on('error', cb)
    db.once('open', _ => {
      return cb(null, mongoose)
    })
  }
}
