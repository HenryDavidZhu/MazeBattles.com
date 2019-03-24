# nonenumerable [![Build status](https://travis-ci.org/endel/nonenumerable.svg?branch=master)](https://travis-ci.org/endel/nonenumerable)

Decorator to make properties non-enumerable.

## Usage

Ensure you have [decorators](https://github.com/wycats/javascript-decorators)
support in your environment. For TypeScript, add `"experimentalDecorators":
true` in your `tsconfig.json`. For Babel, configure [the syntax-decorator
plugin](https://babeljs.io/docs/plugins/syntax-decorators/).

```ts
import { nonenumerable } from "nonenumerable";

class MyClass {
    @nonenumerable
    property = 5;
}
```

License
---

MIT
