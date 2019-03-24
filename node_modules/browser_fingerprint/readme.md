# Browser Fingerprint

[![Build Status](https://circleci.com/gh/actionhero/browser_fingerprint.png)](https://circleci.com/gh/actionhero/browser_fingerprint.png)
[![Greenkeeper badge](https://badges.greenkeeper.io/actionhero/browser_fingerprint.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/browser_fingerprint.png)](https://nodei.co/npm/browser_fingerprint/)

**Note: This package requires node v8, as it makes uses of native classes.**

This module attempts to uniquely identify browsers by examining their header and connection information.  This information can be used as a "poor-man's" session identifier in your node projects. This module can optionally set a cookie to 'lock' in a consistent fingerprint.

Resuming sessions require that either the cookie be returned to the server, or a x-header `x-__browserFingerprint` in the default case, be sent on subsequent requests

```javascript
const http = require('http')
const port = 8080

const BrowserFingerprint = require('browser_fingerprint')

// these are the default options
const options = {
  cookieKey: '__browser_fingerprint',
  toSetCookie: true,
  onlyStaticElements: true,
  settings: {
    path: '/',
    expires: 3600000,
    httpOnly: null
  }
}

const fingerprinter = new BrowserFingerprint(options)

http.createServer((req, res) => {
  let {fingerprint, elementHash, headersHash} = fingerprinter.fingerprint(req)
  headersHash['Content-Type'] = 'text/plain' // append any other headers you want
  res.writeHead(200, headersHash)

  let resp = `Your Browser Fingerprint: ${fingerprint} \r\n\r\n`
  for (let i in elementHash) { resp += `Element ${i}: ${elementHash[i]}\r\n` }

  res.end(resp)
  console.log('requset from ' + req.connection.remoteAddress + ', fingerprint -> ' + fingerprint)
}).listen(port)

console.log(`server running at http://127.0.0.1:${port}`)
```

