#!/usr/bin/env node

const http = require('http')
const port = 8080

// const browserFingerprint = require('browser_fingerprint'); <<-- Normally, you would do this
const BrowserFingerprint = require('../lib/browser_fingerprint.js')

// these are the default options
const options = {
  cookieKey: '__browser_fingerprint',
  toSetCookie: true,
  onlyStaticElements: true,
  settings: {
    path: '/',
    expires: 3600000
  }
}

const fingerprinter = new BrowserFingerprint(options)

http.createServer((req, res) => {
  let { fingerprint, elementHash, headersHash } = fingerprinter.fingerprint(req)
  headersHash['Content-Type'] = 'text/plain' // append any other headers you want
  res.writeHead(200, headersHash)

  let resp = `Your Browser Fingerprint: ${fingerprint} \r\n\r\n`
  for (let i in elementHash) { resp += `Element ${i}: ${elementHash[i]}\r\n` }

  res.end(resp)
  console.log('requset from ' + req.connection.remoteAddress + ', fingerprint -> ' + fingerprint)
}).listen(port)

console.log(`server running at http://127.0.0.1:${port}`)
