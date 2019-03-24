@gamestdio/timeline [![Build Status](https://secure.travis-ci.org/gamestdio/timeline.png?branch=master)](http://travis-ci.org/gamestdio/timeline)
===

[![Greenkeeper badge](https://badges.greenkeeper.io/gamestdio/timeline.svg)](https://greenkeeper.io/)

Timelines implementation for lag compensation techniques in networked games.
Use it both on server and/or client-side according to your needs.

- Take snapshots of game state
- Interpolates and extrapolates values based on snapshots taken.

API
---

- `createTimeline([ maxSnapshots=10 ])` - Create a Timeline instance
- `Timeline#takeSnapshot( state[, elapsedMs ] )` - Record state on timeline history
- `Timeline#at( elapsedMs[, interpolate=true ] )` - Get `Proxy` object containing interpolated values between recorded states.
- `Timeline#offset( elapsedMs[, interpolate=true ] )` - Same as `#at`, but from the last snapshot taken.

Example
---

```javascript
import { createTimeline } from '@gamestdio/timeline'

var timeline = createTimeline()

// first game state snapshot
timeline.takeSnapshot({
  player: { x: 100 },
  enemy: { x: 0 }
})

setTimeout(() => {
  // take second game state snapshot after 1000ms

  timeline.takeSnapshot({
    player: { x: 0 },
    enemy: { x: 100 }
  })

  //
  // Retrieving a previous state
  //
  console.log( timeline.at( 0 ).player.x )
  // => 100
  console.log( timeline.at( 0 ).enemy.x )
  // => 0

  //
  // Interpolating data from known states
  //
  console.log( timeline.at( 500 ).player.x )
  // => 49.75124378109453
  console.log( timeline.at( 500 ).enemy.x )
  // => 50.24875621890547

  //
  // Extrapolating data between an unknown state
  //
  console.log( timeline.at( 1500 ).player.x )
  // => -49.25373134328358
  console.log( timeline.at( 1500 ).enemy.x )
  // => 149.2537313432836

}, 1000)
```

To execute this example run the following command:

```
node --harmony --harmony-proxies example/usage.js
```

References
---

- [Timelines: simplifying the programming of lag compensation for the next generation of networked games](http://link.springer.com/article/10.1007/s00530-012-0271-3#Sec17)

License
---

MIT
