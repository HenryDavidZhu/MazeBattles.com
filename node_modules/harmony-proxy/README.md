# harmony-proxy

Harmony-proxy shims the new-style `new Proxy(target, handler)` API via the
old-style `Proxy.create(handler)` API provided by `node --harmony-proxies`.

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Old_Proxy_API
and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

[![Build Status](https://travis-ci.org/Swatinem/proxy.png?branch=master)](https://travis-ci.org/Swatinem/proxy)
[![Coverage Status](https://coveralls.io/repos/Swatinem/proxy/badge.png?branch=master)](https://coveralls.io/r/Swatinem/proxy)
[![Dependency Status](https://gemnasium.com/Swatinem/proxy.png)](https://gemnasium.com/Swatinem/proxy)

## Installation

    $ npm install harmony-proxy

## Usage

```js
var Proxy = require('harmony-proxy');
```

## License

  LGPLv3

