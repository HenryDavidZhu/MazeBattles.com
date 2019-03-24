const path = require('path')
const http = require('http')
const request = require('request')
const should = require('should')
const BrowserFingerpint = require(path.join(__dirname, '..', 'lib', 'browserFingerprint.js'))

const port = 8081
const url = `http://localhost:${port}`

let fingerprinter
let server
let fingerprint

describe('browser fingerpint', () => {
  before(() => {
    server = http.createServer((req, res) => {
      let { fingerprint, elementHash, headersHash } = fingerprinter.fingerprint(req)
      headersHash['Content-Type'] = 'text/plain'
      res.writeHead(200, headersHash)
      let resp = `Fingerprint: ${fingerprint} \r\n\r\n`
      for (let i in elementHash) { resp += `Element ${i}: ${elementHash[i]}\r\n` }
      res.end(resp)
    }).listen(port)
  })

  after(() => {
    server.close()
  })

  it('works with defaults', (done) => {
    fingerprinter = new BrowserFingerpint()

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      fingerprint = fingerprintCookie.split('=')[1]
      response.body.should.containEql(fingerprint)
      done()
    })
  })

  it('will generate a new fingerprint for a new request', (done) => {
    fingerprinter = new BrowserFingerpint()

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let thisFingerprint = fingerprintCookie.split('=')[1]
      thisFingerprint.should.not.equal(fingerprint)
      done()
    })
  })

  it('can have a custom cookieKey', (done) => {
    fingerprinter = new BrowserFingerpint({ cookieKey: 'myCookie' })

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let cookieKey = fingerprintCookie.split('=')[0]
      cookieKey.should.equal('myCookie')
      done()
    })
  })

  it('can have more entropy', (done) => {
    fingerprinter = new BrowserFingerpint({ onlyStaticElements: false })

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let thisFingerprint = fingerprintCookie.split('=')[1]
      thisFingerprint.should.not.equal(fingerprint)
      done()
    })
  })

  it('will return the same fingerprint if the cookie is already set via cookie, and not re-set the cookie', (done) => {
    fingerprinter = new BrowserFingerpint()
    let j = request.jar()

    request.get(url, { jar: j }, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let thisFingerprint = fingerprintCookie.split('=')[1]
      response.body.should.containEql(thisFingerprint)
      request.get(url, { jar: j }, (error, response) => {
        should.not.exist(error)
        should.not.exist(response.headers['set-cookie'])
        response.body.should.containEql(thisFingerprint)
        done()
      })
    })
  })

  it('will return the same fingerprint if the cookie is already set via header, and not re-set the cookie', (done) => {
    fingerprinter = new BrowserFingerpint()

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let thisFingerprint = fingerprintCookie.split('=')[1]
      response.body.should.containEql(thisFingerprint)
      request.get(url, { headers: {
        '__browser_fingerprint': thisFingerprint
      } }, (error, response) => {
        should.not.exist(error)
        should.not.exist(response.headers['set-cookie'])
        response.body.should.containEql(thisFingerprint)
        done()
      })
    })
  })

  it('will return the same fingerprint if the cookie is already set via x-header, and not re-set the cookie', (done) => {
    fingerprinter = new BrowserFingerpint()

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let thisFingerprint = fingerprintCookie.split('=')[1]
      response.body.should.containEql(thisFingerprint)
      request.get(url, { headers: {
        'x-__browser_fingerprint': thisFingerprint
      } }, (error, response) => {
        should.not.exist(error)
        should.not.exist(response.headers['set-cookie'])
        response.body.should.containEql(thisFingerprint)
        done()
      })
    })
  })

  it('can disable setting the cookie', (done) => {
    fingerprinter = new BrowserFingerpint({ toSetCookie: false })

    request.get(url, (error, response) => {
      should.not.exist(error)
      should.not.exist(response.headers['set-cookie'])
      done()
    })
  })

  it('works with directives without value', (done) => {
    let options = { settings: { httpOnly: null, secure: null } }
    fingerprinter = new BrowserFingerpint(options)

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let httpOnlyDirective = fingerprintCookie.split(';')[1]
      let secureDirective = fingerprintCookie.split(';')[2]

      httpOnlyDirective.should.be.exactly('httpOnly')
      secureDirective.should.be.exactly('secure')
      done()
    })
  })

  it('works with directives with and without value', (done) => {
    let options = { settings: { expires: 3600000, httpOnly: null, path: '/', secure: null } }
    fingerprinter = new BrowserFingerpint(options)

    request.get(url, (error, response) => {
      should.not.exist(error)
      let fingerprintCookie = response.headers['set-cookie'][0]
      let expiresDirective = fingerprintCookie.split(';')[1]
      let httpOnlyDirective = fingerprintCookie.split(';')[2]
      let pathDirective = fingerprintCookie.split(';')[3]
      let secureDirective = fingerprintCookie.split(';')[4]

      expiresDirective.should.containEql('expires=')
      httpOnlyDirective.should.be.exactly('httpOnly')
      secureDirective.should.be.exactly('secure')
      pathDirective.should.be.exactly('path=/')
      done()
    })
  })
})
