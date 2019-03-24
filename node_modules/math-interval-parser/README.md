# Math interval parser
[![Build Status](https://travis-ci.org/Semigradsky/math-interval-parser.svg)](https://travis-ci.org/Semigradsky/math-interval-parser) [![Dependency Status](https://david-dm.org/Semigradsky/math-interval-parser.svg)](https://david-dm.org/Semigradsky/math-interval-parser) [![Coverage Status](https://coveralls.io/repos/Semigradsky/math-interval-parser/badge.svg)](https://coveralls.io/r/Semigradsky/math-interval-parser)

> Parse math interval. Notation is accepted as part of [ISO 31-11](http://en.wikipedia.org/wiki/ISO_31-11).


## Install

```sh
$ npm install --save math-interval-parser
```


## Usage

```js
import intervalParse from 'math-interval-parser';
// or `var intervalParse = require('math-interval-parser').default;

intervalParse('(-10,20.2]'); // or intervalParse(']-10,20.2]');
//=> {
//=>     from: {
//=>         value: -10,
//=>         included: false,
//=>     },
//=>     to: {
//=>         value: 20.2,
//=>         included: true
//=>     }
//=> }

intervalParse('[1e3,)'); // or intervalParse('[1e3,Infinity)');
//=> {
//=>     from: {
//=>         value: 1000,
//=>         included: true,
//=>     },
//=>     to: {
//=>         value: Infinity,
//=>         included: false
//=>     }
//=> }
```

See tests for more details.


## License

MIT © Dmitry Semigradsky
