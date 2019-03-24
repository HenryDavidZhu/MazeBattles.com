export function nonenumerable(target: Object, key: string) {
    Object.defineProperty(target, key, {
        get: function () { return undefined; },
        set: function (this: any, val: any) {
            Object.defineProperty(this, key, {
                value: val,
                writable: true,
                enumerable: false,
                configurable: true,
            });
        },
        enumerable: false,
    });
}