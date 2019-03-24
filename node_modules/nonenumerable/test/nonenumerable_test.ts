import { assert } from "chai";
import { nonenumerable } from "../src/index";

class NonEnumerable {
    public a = 1;
    private b = 2;

    @nonenumerable
    c = 3;

    constructor () {
    }
}

describe("nonenumerable", () => {
    let nonEnumerable = new NonEnumerable();

    it("shouldn't iterate though nonenumerable field", () => {
        let keys = [];
        for (let k in nonEnumerable) {
            keys.push(k);
        }
        assert.deepEqual(keys, ['a', 'b']);
    });

    it("shouldn't serialize nonenumerable fields", () => {
        assert.equal(JSON.stringify(nonEnumerable), '{"a":1,"b":2}');
    });

    it("should get value from object", () => {
        assert.equal(nonEnumerable.c, 3);
    });

    it("should set value from object", () => {
        nonEnumerable.c = 20;
        assert.equal(nonEnumerable.c, 20);
    });

    it("Object.getOwnPropertyNames should return non-enumerable ones", () => {
        assert.deepEqual(Object.getOwnPropertyNames(nonEnumerable), ['a', 'b', 'c']);
    });

    it("should support multiple instances", () => {
        let secondInstance = new NonEnumerable();
        secondInstance.c = 10;
        assert.notEqual(secondInstance.c, nonEnumerable.c);
    });

    it("should allow to delete the variable", () => {
        delete nonEnumerable.c;
        assert.equal(nonEnumerable.c, undefined);
    });

});
