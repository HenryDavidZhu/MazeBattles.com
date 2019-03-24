# notepack

[![Build Status](https://travis-ci.org/coinative/notepack.svg?branch=master)](https://travis-ci.org/coinative/notepack)
[![Coverage Status](https://coveralls.io/repos/github/darrachequesne/notepack/badge.svg?branch=master)](https://coveralls.io/github/darrachequesne/notepack?branch=master)

A fast [Node.js](http://nodejs.org) implementation of the latest [MessagePack](http://msgpack.org) [spec](https://github.com/msgpack/msgpack/blob/master/spec.md).

## Notes

* This implementation is not backwards compatible with those that use the older spec. It is recommended that this library is only used in isolated systems.
* `undefined` is encoded as `fixext 1 [0, 0]`, i.e. `<Buffer d4 00 00>`
* `Date` objects are encoded as `fixext 8 [0, ms]`, e.g. `new Date('2000-06-13T00:00:00.000Z')` => `<Buffer d7 00 00 00 00 df b7 62 9c 00>`
* `ArrayBuffer` are encoded as `ext 8/16/32 [0, data]`, e.g. `Uint8Array.of(1, 2, 3, 4)` => `<Buffer c7 04 00 01 02 03 04>`

## Install

```
npm install notepack.io
```

## Usage

```js
var notepack = require('notepack.io');

var encoded = notepack.encode({ foo: 'bar'}); // <Buffer 81 a3 66 6f 6f a3 62 61 72>
var decoded = notepack.decode(encoded); // { foo: 'bar' }
```

## Browser

A browser version of notepack is also available (7.6 kB minified)

```html
<script src="https://rawgit.com/darrachequesne/notepack/master/dist/notepack.js"></script>
<script>
  console.log(notepack.decode(notepack.encode([1, '2', new Date()])));
  // [1, "2", Thu Dec 08 2016 00:00:01 GMT+0100 (CET)]
</script>
```

## Performance

Performance is currently comparable to msgpack-node (which presumably needs optimizing and suffers from JS-native overhead) and is significantly faster than other implementations. Several micro-optimizations are used to improve the performance of short string and Buffer operations.

The `./benchmarks/run` output on my machine is:

```
$ node -v
v6.9.1
$ ./benchmarks/run
Encoding (this will take a while):
+----------------------------+-------------------+-----------------+----------------+---------------+
|                            │ tiny              │ small           │ medium         │ large         |
+----------------------------+-------------------+-----------------+----------------+---------------+
| notepack                   │ 1,118,284 ops/sec │ 290,050 ops/sec │ 19,670 ops/sec │ 146 ops/sec   |
+----------------------------+-------------------+-----------------+----------------+---------------+
| msgpack-js                 │ 116,413 ops/sec   │ 29,831 ops/sec  │ 3,199 ops/sec  │ 57.73 ops/sec |
+----------------------------+-------------------+-----------------+----------------+---------------+
| msgpack-lite               │ 229,063 ops/sec   │ 92,016 ops/sec  │ 12,620 ops/sec │ 169 ops/sec   |
+----------------------------+-------------------+-----------------+----------------+---------------+
| JSON.stringify (to Buffer) │ 811,373 ops/sec   │ 111,166 ops/sec │ 2,556 ops/sec  │ 2.83 ops/sec  |
+----------------------------+-------------------+-----------------+----------------+---------------+
Decoding (this will take a while):
+--------------------------+-------------------+-----------------+----------------+---------------+
|                          │ tiny              │ small           │ medium         │ large         |
+--------------------------+-------------------+-----------------+----------------+---------------+
| notepack                 │ 860,763 ops/sec   │ 179,459 ops/sec │ 17,642 ops/sec │ 184 ops/sec   |
+--------------------------+-------------------+-----------------+----------------+---------------+
| msgpack-js               │ 522,966 ops/sec   │ 132,121 ops/sec │ 12,445 ops/sec │ 179 ops/sec   |
+--------------------------+-------------------+-----------------+----------------+---------------+
| msgpack-lite             │ 566,976 ops/sec   │ 114,859 ops/sec │ 9,520 ops/sec  │ 156 ops/sec   |
+--------------------------+-------------------+-----------------+----------------+---------------+
| JSON.parse (from Buffer) │ 1,177,912 ops/sec │ 277,076 ops/sec │ 18,430 ops/sec │ 38.74 ops/sec |
+--------------------------+-------------------+-----------------+----------------+---------------+
* Note that JSON is provided as an indicative comparison only
```

## License

MIT
