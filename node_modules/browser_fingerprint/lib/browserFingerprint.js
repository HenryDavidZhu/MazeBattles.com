const crypto = require('crypto')
const os = require('os')

class BrowserFingerprint {
  constructor (options) {
    if (!options) { options = {} }
    this.options = options

    this.savedHashedHostName = null
    this.hashedHostName()
    this.savedHashedPid = null
    this.hashedPid()
  }

  defaults () {
    return {
      cookieKey: '__browser_fingerprint',
      toSetCookie: true,
      onlyStaticElements: false
    }
  }

  fingerprint (req) {
    // The goal is to come up with as many *potentially* unique traits for the connection and add them to the elementsHash.
    // The collection of all the elementsHash keys will *hopefully* be unique enough for fingerprinting
    // Then, we save this hash in a cookie for later retrieval
    let fingerprint
    let key
    let value
    let cookies = this.parseCookies(req)
    let defaults = this.defaults()
    for (let i in defaults) { if (this.options[i] == null) { this.options[i] = defaults[i] } }

    if (cookies[this.options.cookieKey] != null) {
      fingerprint = cookies[this.options.cookieKey]
      return { fingerprint, elementHash: { clientCookie: fingerprint }, headersHash: {} }
    }

    if (req.headers[this.options.cookieKey] != null) {
      fingerprint = req.headers[this.options.cookieKey]
      return { fingerprint, elementHash: { clientCookie: fingerprint }, headersHash: {} }
    }

    if (req.headers[('x-' + this.options.cookieKey).toLowerCase()] != null) {
      fingerprint = req.headers[('x-' + this.options.cookieKey).toLowerCase()]
      return { fingerprint, elementHash: { clientCookie: fingerprint }, headersHash: {} }
    }

    let remoteAddress = req.headers['x-forwarded-for']
    if (!remoteAddress) { remoteAddress = req.connection.remoteAddress }

    let elementsHash = {
      httpVersion: req.httpVersion,
      remoteAddress: remoteAddress,
      cookieKey: this.options.cookieKey,
      hashedHostName: this.hashedHostName()
    }

    // these elements add greater entropy to the fingerprint, but aren't gaurnteed to be the same uppon each request
    if (this.options.onlyStaticElements !== true) {
      elementsHash.remotePort = req.connection.remotePort
      elementsHash.rand = Math.random()
      elementsHash.time = new Date().getTime()
      elementsHash.hashedPid = this.hashedPid()
    };

    for (let j in req.headers) {
      if (this.options.onlyStaticElements && (j === 'cookie' || j === 'referer')) { continue }
      key = 'header_' + j
      elementsHash[key] = req.headers[j]
    }

    elementsHash = this.sortAndStringObject(elementsHash)
    fingerprint = this.calculateHashFromElemets(elementsHash)

    let headersHash = {}
    if (this.options.toSetCookie === true) {
      if (this.options.settings !== undefined && this.options.settings !== null) {
        let settingsParams = ''
        /*
        new version in object format e.g.
        settings : {path : '/', expires : 86400000 }

        old version till v0.0.4 e.g.
        settings :'path=/;expires=' + new Date(new Date().getTime() + 86400000).toUTCString()+';'
        */

        /* Check to be compatible to both version */
        if (typeof (this.options.settings) === 'object') {
          for (key in this.options.settings) {
            if (this.options.settings.hasOwnProperty(key)) {
              value = this.options.settings[key]
              if (key === 'expires') {
                value = new Date(new Date().getTime() + this.options.settings[key]).toUTCString()
              }
              settingsParams = settingsParams + key + (value ? '=' + value : '') + ';'
            }
          }
        } else {
          settingsParams = this.options.settings
        }
        headersHash = { 'Set-Cookie': this.options.cookieKey + '=' + fingerprint + ';' + settingsParams }
      } else {
        headersHash = { 'Set-Cookie': this.options.cookieKey + '=' + fingerprint }
      }
    }

    return { fingerprint, elementsHash, headersHash }
  }

  hashedHostName () {
    if (this.savedHashedHostName != null) {
      return this.savedHashedHostName
    } else {
      let md5sum = crypto.createHash('md5')
      md5sum.update(os.hostname())
      this.savedHashedHostName = md5sum.digest('hex')
      return this.savedHashedHostName
    }
  }

  hashedPid () {
    if (this.savedHashedPid != null) {
      return this.savedHashedPid
    } else {
      let md5sum = crypto.createHash('md5')
      md5sum.update(String(process.pid))
      this.savedHashedPid = md5sum.digest('hex')
      return this.savedHashedPid
    }
  }

  parseCookies (req) {
    let cookies = {}
    if (req.headers.cookie != null) {
      req.headers.cookie.split(';').forEach((cookie) => {
        let parts = cookie.split('=')
        cookies[ parts[ 0 ].trim() ] = (parts[ 1 ] || '').trim()
      })
    }

    return cookies
  }

  calculateHashFromElemets (elementsHash) {
    let shasum = crypto.createHash('sha1')
    for (let i in elementsHash) {
      shasum.update(elementsHash[i])
    }

    return shasum.digest('hex')
  }

  sortAndStringObject (o) {
    let sorted = {}
    var key
    let a = []

    for (key in o) {
      if (o.hasOwnProperty(key)) {
        a.push(key)
      }
    }

    a.sort()

    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = String(o[a[key]])
    }

    return sorted
  }
}

module.exports = BrowserFingerprint
