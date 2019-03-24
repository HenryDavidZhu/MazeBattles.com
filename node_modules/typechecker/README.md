
<!-- TITLE/ -->

# TypeChecker

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](https://img.shields.io/travis/bevry/typechecker/master.svg)](http://travis-ci.org/bevry/typechecker "Check this project's build status on TravisCI")
[![NPM version](https://img.shields.io/npm/v/typechecker.svg)](https://npmjs.org/package/typechecker "View this project on NPM")
[![NPM downloads](https://img.shields.io/npm/dm/typechecker.svg)](https://npmjs.org/package/typechecker "View this project on NPM")
[![Dependency Status](https://img.shields.io/david/bevry/typechecker.svg)](https://david-dm.org/bevry/typechecker)
[![Dev Dependency Status](https://img.shields.io/david/dev/bevry/typechecker.svg)](https://david-dm.org/bevry/typechecker#info=devDependencies)<br/>
[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://bevry.me/bitcoin "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](https://bevry.me/wishlist "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Utilities to get and check variable types (isString, isPlainObject, isRegExp, etc)

<!-- /DESCRIPTION -->


## Why?

Why should I use this instead of say `instanceof`?

Under certain circumstances `instanceof` may not return the correct results. This occurs with [node's vm module](http://nodejs.org/api/vm.html#vm_globals) especially, and circumstances where an object's prototype has been dereferenced from the original. As such, for basic `==` and `===` checks (like `a === null`), you're fine not using this, but for checks when you would have done `instanceof` (like `err instanceof Error`), you should try to use this instead. Plus things like `isEmpty`, `isEmptyObject` and `isPlainObject` are darn useful!


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('typechecker')`
- Install: `npm install --save typechecker`

### [Browserify](http://browserify.org/)
- Use: `require('typechecker')`
- Install: `npm install --save typechecker`
- CDN URL: `//wzrd.in/bundle/typechecker@2.1.0`

### [Ender](http://enderjs.com)
- Use: `require('typechecker')`
- Install: `ender add typechecker`

<!-- /INSTALL -->


## Usage

### Example

``` javascript
require('typechecker').isRegExp(/^a/)  // returns true
```

### Methods

Helpers:

- `getObjectType` - returns the object string of the value, e.g. when passed `/^a/` it'll return `"[object RegExp]"`
- `getType` - returns lower case string of the type, e.g. when passed `/^a/` it'll return `"regex"`

Values:

- `isPlainObject` - returns `true` if the value doesn't have a custom prototype
- `isEmpty` - returns `true` if the value is `null` or `undefined`
- `isEmptyObject` - returns `true` if the object has no keys that are its own

Types:

- `isError` - returns `true` if the value is an error, otherwise `false`
- `isDate` - returns `true` if the value is a date, otherwise `false`
- `isArguments` - returns `true` if the value is function arguments, otherwise `false`
- `isFunction` - returns `true` if the value is a function, otherwise `false`
- `isRegExp` - returns `true` if the value is a regular expression instance, otherwise `false`
- `isArray` - returns `true` if the value is an array, otherwise `false`
- `isNumber` - returns `true` if the value is a number (`"2"` is a string), otherwise `false`
- `isString` - returns `true` if the value is a string, otherwise `false`
- `isBoolean` - returns `true` if the value is a boolean, otherwise `false`
- `isNull` - returns `true` if the value is null, otherwise `false`
- `isUndefined` - returns `true` if the value is undefined, otherwise `false`


<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/bevry/typechecker/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/bevry/typechecker/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://bevry.me/bitcoin "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](https://bevry.me/wishlist "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [Benjamin Lupton](https://github.com/balupton) <b@lupton.cc> — [view contributions](https://github.com/bevry/typechecker/commits?author=balupton)
- [joegesualdo](https://github.com/joegesualdo) — [view contributions](https://github.com/bevry/typechecker/commits?author=joegesualdo)
- [sfrdmn](https://github.com/sfrdmn) — [view contributions](https://github.com/bevry/typechecker/commits?author=sfrdmn)

[Become a contributor!](https://github.com/bevry/typechecker/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Unless stated otherwise all works are:

- Copyright &copy; 2013+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)
- Copyright &copy; 2011-2012 Benjamin Lupton <b@lupton.cc> (http://balupton.com)

and licensed under:

- The incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://opensource.org/licenses/mit-license.php)

<!-- /LICENSE -->


