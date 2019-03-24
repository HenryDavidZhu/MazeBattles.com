

# memshared

[![Build Status](https://secure.travis-ci.org/endel/memshared.png?branch=master)](http://travis-ci.org/endel/memshared)

Redis-like in-memory database for NodeJS clustered applications.

## Why?

Adding Redis as a dependency will inevitably increase the complexity to your
application and your environment. Use this library if you want to keep a simple
architecture while at the same time allow you to migrate to a real in-memory
database when you feel the need for it.

## Usage

```typescript
import * as cluster from "cluster";
import * as memshared from "memshared";

if (cluster.isMaster) {
  memshared.setup({
    // setup your initial data
  });

  cluster.fork();

} else {
  memshared.set('foo', 'bar');

  memshared.get('foo', function (err, result) {
    console.log(result);
  });

  memshared.del('key');

  memshared.sadd('set', 1);
}
```

## Usage with PM2

You'll need a script to start PM2. See [this example](pm2/pm2.js).

```
node pm2/pm2.js
```

## Missing commands

There are a lot of commands missing. Feel free to pick one of them and send a
pull-request: https://github.com/endel/memshared/issues/7

## License

MIT
