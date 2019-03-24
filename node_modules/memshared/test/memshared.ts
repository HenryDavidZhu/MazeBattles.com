import { assert } from "chai";

import * as commands from "../src/commands";
import * as cluster from "cluster";
import { setup } from "../src/index";

describe("memshared", () => {

    if (cluster.isMaster) {
        let workers = [
            cluster.fork(),
            // cluster.fork(),
        ];

        it("should set up with initial data", () => {
            setup({
                number: 1,
                number_decr: 5,
                number_decrby: 5,
                number_incr: 5,
                number_incrby: 5,
                string: "Hello world!",
                hash: { one: 1, two: 2, three: 3 },
                mutateme: { one: 1, two: 2, three: 3 },
                deleteme: { one: 1, two: 2, three: 3 },
                deletemetoo: 1,
                renameme: 1,
                mylist: [ "one", "two", "three" ],
                list: [ 9, 8, 7, 6, 5, 4, 3, 2, 1 ],
                list_pop_2: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                list_pop_3: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                list_pop_4: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                list_pop_5: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                list_pop_6: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                list_pop_7: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
                set: new Set([ 9, 8, 7, 6, 5, 4, 3, 2, 1 ]),
                set_pop: new Set([ 9, 8, 7, 6, 5, 4, 3, 2, 1 ]),
                set_pop2: new Set([ 9, 8, 7, 6, 5, 4, 3, 2, 1 ]),
            });
        });

        it("all tests", (done) => {
            let finished: number = 0;

            workers.forEach(worker => {
                worker.on("exit", () => {
                    finished++;

                    if (finished === workers.length) {
                        done();
                    }
                });
            });
        }).timeout(5000);;

    } else {
        // Exit worker on completion
        after(() => process.exit());

        //
        // String
        //
        describe("string", () => {
            describe("#get", () => {
                it("get", () => {
                    commands.get("number", (err, result) => {
                        assert.equal(result, 1);
                    });
                });
            });

            describe("#set", () => {
                it("set", (done) => {
                    commands.set("key", "value", (err, result) => {
                        assert.equal(result, "OK");
                        commands.get("key", (err, result) => {
                            assert.equal(result, "value");
                            done();
                        });
                    });
                });
            });

            describe("#setex", () => {
                it("shouldn't throw exception without the callback", (done) => {
                    commands.setex("tmpkey-2", 0.1, "value");
                    setTimeout(done, 150);
                });

                it("should delete key after timeout", (done) => {
                    commands.setex("tmpkey", 0.1, "value", (err, result) => {
                        assert.equal(result, "OK");
                        commands.get("tmpkey", (err, result) => {
                            assert.equal(result, "value");
                            setTimeout(() => {
                                commands.get("tmpkey", (err, result) => {
                                    assert.notOk(result);
                                    done();
                                });
                            }, 0.2 * 1000);
                        });
                    });
                });
            });

            describe("#decr", () => {
                it("should decrease non-existing key", (done) => {
                    commands.decr("decr-non-existing", (err, result) => {
                        assert.equal(result, -1);
                        commands.get("decr-non-existing", (err, result) => {
                            assert.equal(result, -1);
                            done();
                        });
                    });
                });

                it("should decrease existing key", (done) => {
                    commands.decr("number_decr", (err, result) => {
                        assert.equal(result, 4);
                        commands.get("number_decr", (err, result) => {
                            assert.equal(result, 4);
                            done();
                        });
                    });
                });
            });

            describe("#decrby", () => {
                it("should decrease non-existing key", (done) => {
                    commands.decrby("decrby-non-existing", 3, (err, result) => {
                        assert.equal(result, -3);
                        commands.get("decrby-non-existing", (err, result) => {
                            assert.equal(result, -3);
                            done();
                        });
                    });
                });

                it("should decrease existing key", (done) => {
                    commands.decrby("number_decrby", 3, (err, result) => {
                        assert.equal(result, 2);
                        commands.get("number_decrby", (err, result) => {
                            assert.equal(result, 2); done();
                        });
                    });
                });
            });


            describe("#incr", () => {
                it("should increase non-existing key", (done) => {
                    commands.incr("incr-non-existing", (err, result) => {
                        assert.equal(result, 1);
                        commands.get("incr-non-existing", (err, result) => {
                            assert.equal(result, 1);
                            done();
                        });
                    });
                });

                it("should increase existing key", (done) => {
                    commands.incr("number_incr", (err, result) => {
                        assert.equal(result, 6);
                        commands.get("number_incr", (err, result) => {
                            assert.equal(result, 6);
                            done();
                        });
                    });
                });
            });

            describe("#incrby", () => {
                it("should increase non-existing key", (done) => {
                    commands.incrby("incrby-non-existing", 3, (err, result) => {
                        assert.equal(result, 3);
                        commands.get("incrby-non-existing", (err, result) => {
                            assert.equal(result, 3);
                            done();
                        });
                    });
                });

                it("should increase existing key", (done) => {
                    commands.incrby("number_incrby", 3, (err, result) => {
                        assert.equal(result, 8);
                        commands.get("number_incrby", (err, result) => {
                            assert.equal(result, 8); done();
                        });
                    });
                });
            });

            describe("#strlen", () => {
                it("should return 0 for non-existing key", (done) => {
                    commands.strlen("strlen-non-existing", (err, result) => {
                        assert.equal(result, 0);
                        done();
                    });
                });

                it("should return string length for existing key", (done) => {
                    commands.strlen("string", (err, result) => {
                        assert.equal(result, 12);
                        done();
                    });
                });
            });

            describe("#mget", () => {
                it("should get multiple values in one call", (done) => {
                    commands.mget(["number", "string", "non-existing", "mylist"], (err, result) => {
                        assert.deepEqual(result, [1, "Hello world!", null, [ "one", "two", "three" ]]);
                        done();
                    });
                });
            });

        });

        //
        // Key
        //
        describe("key", () => {
            describe("#delete", () => {
                it("delete", (done) => {
                    commands.del("deletemetoo", (err, result) => {
                        assert.equal(result, "OK");

                        commands.get("deletemetoo", (err, result) => {
                            assert.equal(undefined, result);
                            done();
                        });
                    });
                });
            });

            describe("#exists", () => {
                it("should return false when key doesn't exists", (done) => {
                    commands.exists("non-existent-key", (err, result) => {
                        assert.equal(result, false);
                        done();
                    });
                });

                it("should return true if key exists", (done) => {
                    commands.exists("number", (err, result) => {
                        assert.equal(result, true);
                        done();
                    });
                });
            });

            describe("#keys", () => {
                it("should return empty if couldn't match any key", (done) => {
                    commands.keys("numberrr*", (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });

                it("should return all matching keys", (done) => {
                    commands.keys("number*", (err, result) => {
                        assert.deepEqual(result, ['number', 'number_decr', 'number_decrby', 'number_incr', 'number_incrby']);
                        done();
                    });
                });
            });

            describe("#rename", () => {
                it("should throw an error for non-existing keys", (done) => {
                    commands.rename("rename-non-existing", "renamed", (err, result) => {
                        assert.isString(err);
                        done();
                    });
                });

                it("should rename key", (done) => {
                    commands.rename("renameme", "renamed", (err, result) => {
                        commands.get("renamed", (err, result) => {
                            assert.equal(result, 1);
                            done();
                        });
                    });
                });
            });

            describe("#type", () => {
                it("should return number type", (done) => {
                    commands.type("number", (err, result) => {
                        assert.equal(result, "number");
                        done();
                    });
                });

                it("should return string type", (done) => {
                    commands.type("string", (err, result) => {
                        assert.equal(result, "string");
                        done();
                    });
                });

                it("should return set type", (done) => {
                    commands.type("set", (err, result) => {
                        assert.equal(result, "set");
                        done();
                    });
                });

                it("should return list type", (done) => {
                    commands.type("list", (err, result) => {
                        assert.equal(result, "list");
                        done();
                    });
                });

                it("should return hash type", (done) => {
                    commands.type("hash", (err, result) => {
                        assert.equal(result, "hash");
                        done();
                    });
                });

            });
        });

        //
        // Hash
        //
        describe("hash", () => {

            describe("#hdel", () => {
                it("should error when trying to delete invalid key", (done) => {
                    commands.hdel("not-a-hash", "key", (err, result) => {
                        assert.typeOf(err, "string");
                        done();
                    });
                });

                it("should error when trying to delete invalid key", (done) => {
                    commands.hdel("deleteme", "one", (err, result) => {
                        assert.equal(result, "OK");
                        done();
                    });
                });
            });


            describe("#hget", () => {
                it("should return array of keys and values", (done) => {
                    commands.hget("hash", "one", (err, result) => {
                        assert.equal(result, 1);
                        done();
                    });
                });

                it("should return undefined for non-existing key", (done) => {
                    commands.hget("not-a-hash", "field", (err, result) => {
                        assert.deepEqual(result, undefined);
                        done();
                    });
                });
            });

            describe("#hgetall", () => {
                it("should return array of keys and values", (done) => {
                    commands.hgetall("hash", (err, result) => {
                        assert.deepEqual(result, ['one', 1, 'two', 2, 'three', 3]);
                        done();
                    });
                });

                it("should return empty for non-existing keys", (done) => {
                    commands.hgetall("not-a-hash", (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });
            });

            describe("#hincrby", () => {
                it("should increment non-existing keys", (done) => {
                    commands.hincrby("non-existing", "field", 2, (err, result) => {
                        assert.equal(result, 2);
                        commands.hget("non-existing", "field", (err, result) => {
                            assert.equal(result, 2);
                            done();
                        });
                    });
                });

                it("should increment existing values", (done) => {
                    commands.hincrby("mutateme", "two", 1, (err, result) => {
                        assert.equal(result, 3);
                        commands.hget("mutateme", "two", (err, result) => {
                            assert.equal(result, 3);
                            done();
                        });
                    });
                });
            });

            describe("#hkeys", () => {
                it("should return empty for non-existing keys", (done) => {
                    commands.hkeys("non-existing-hkeys", (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });

                it("should return array of keys for valid object", (done) => {
                    commands.hkeys("hash", (err, result) => {
                        assert.deepEqual(result, ['one', 'two', 'three']);
                        done();
                    });
                });
            });

            describe("#hvals", () => {
                it("should return empty for non-existing keys", (done) => {
                    commands.hvals("non-existing-hkeys", (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });

                it("should return array of values for valid object", (done) => {
                    commands.hvals("hash", (err, result) => {
                        assert.deepEqual(result, [1, 2, 3]);
                        done();
                    });
                });
            });

            describe("#hlen", () => {
                it("should return 0 for non-existing keys", (done) => {
                    commands.hlen("non-existing-hlen", (err, result) => {
                        assert.equal(result, 0);
                        done();
                    });
                });

                it("should return number of keys for valid object", (done) => {
                    commands.hlen("hash", (err, result) => {
                        assert.deepEqual(result, 3);
                        done();
                    });
                });
            });

            describe("#hset", () => {
                it("should set value for a hash", (done) => {
                    commands.hset("mutateme", "newkey", "value", (err, result) => {
                        assert.equal(result, true);
                        commands.hget("mutateme", "newkey", (err, result) => {
                            assert.equal(result, "value");
                            done();
                        });
                    });
                });
            });

        });

        //
        // Set
        //
        describe("set", () => {
            describe("#sadd", () => {
                it("should add item to set", (done) => {
                    commands.sadd("sadd-set", "element", (err, result) => {
                        assert.equal(result, true);
                        commands.sismember("sadd-set", "element", (err, result) => {
                            assert.equal(result, true);
                            done();
                        });
                    });
                });
            });

            describe("#scard", () => {
                it("should get number of elements on set", (done) => {
                    commands.scard("set", (err, result) => {
                        assert.equal(result, 9);
                        done();
                    });
                });
            });

            describe("#sismember", () => {
                it("should return true if member is found", (done) => {
                    commands.sismember("set", 1, (err, result) => {
                        assert.equal(result, true);
                        done();
                    });
                });

                it("should return false if member couldn't be found", (done) => {
                    commands.sismember("set", 20, (err, result) => {
                        assert.equal(result, false);
                        done();
                    });
                });
            });

            describe("#smembers", () => {
                it("should return empty for non-existing keys", (done) => {
                    commands.smembers("smembers-non-existing-key", (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });

                it("should return all elements for valid key", (done) => {
                    commands.smembers("set", (err, result) => {
                        assert.deepEqual(result, [ 9, 8, 7, 6, 5, 4, 3, 2, 1 ]);
                        done();
                    });
                });

            });

            describe("#srandmember", () => {
                it("should return distinct values from set", (done) => {
                    commands.srandmember("set", 2, (err, result) => {
                      assert.equal(2, result.length);
                      assert.notEqual(result[0], result[1]);
                      done();
                    });
                });

                it("should return the whole set", (done) => {
                    commands.srandmember("set", 20, (err, result) => {
                        assert.notEqual(result[0], result[1]);
                        commands.scard("set", (err, setSize) => {
                            assert.equal(result.length, setSize);
                            done();
                        });
                    });
                });

                it("should return non-distinct values", (done) => {
                    commands.srandmember("set", -12, (err, result) => {
                        assert.equal(12, result.length);
                        done();
                    });
                });
            });

            describe("#spop", () => {
                it("should return null for non-existing keys", (done) => {
                    commands.spop("smembers-non-existing-key", 1, (err, result) => {
                        assert.equal(result, null);
                        done();
                    });
                });

                it("should return a random value", (done) => {
                    commands.spop("set_pop2", 1, (err, result) => {
                        assert.isArray(result);
                        assert.isTrue([1,2,3,4,5,6,7,8,9].indexOf(result[0]) >= 0);
                        commands.scard("set_pop2", (err, result) => {
                            assert.equal(result, 8);
                            done();
                        });
                    });
                });

            });

            describe("#srem", () => {
                it("should return false for non-existing keys", (done) => {
                    commands.srem("srem-non-existing-key", "it-doesn't-work-anyway", (err, result) => {
                        assert.equal(result, false);
                        done();
                    });
                });

                it("should return true if removed successfully", (done) => {
                    commands.srem("set_pop", 5, (err, result) => {
                        assert.equal(result, true);
                        done();
                    });
                });

            });
        });

        //
        // List
        //
        describe("list", () => {

            describe("#lindex", () => {
                it("should return null for non-existing keys", (done) => {
                    commands.lindex("lindex-non-existing", "value", (err, result) => {
                        assert.equal(result, null);
                        done();
                    });
                });

                it("should return valid number", (done) => {
                    commands.lindex("list", 5, (err, result) => {
                        assert.equal(result, 4);
                        done();
                    });
                });
            });

            describe("#llen", () => {
                it("should return 0 for non-existing keys", (done) => {
                    commands.llen("llen-non-existing", (err, result) => {
                        assert.equal(result, 0);
                        done();
                    });
                });

                it("should return valid number", (done) => {
                    commands.llen("list", (err, result) => {
                        assert.equal(result, 9);
                        done();
                    });
                });
            });

            describe("#lpop", () => {
                it("should return null for non-existing keys", (done) => {
                    commands.lpop("lpop-non-existing", (err, result) => {
                        assert.equal(result, null);
                        done();
                    });
                });

                it("should return valid number", (done) => {
                    commands.lpop("list_pop_2", (err, result) => {
                        assert.equal(result, 1);
                        done();
                    });
                });
            });

            describe("#rpoplpush", () => {
                it("should remove first item of source a push into destination", (done) => {
                    commands.rpoplpush("list_pop_3", "list", (err, result) => {
                        assert.equal(result, 9);
                        commands.llen("list", (err, result) => {
                            assert.equal(result, 10);
                            done();
                        });
                    });
                });
            });

            describe("#rpush", () => {
                it("should create new list and insert new element to the list", (done) => {
                    commands.rpush("list_pop_create_new34", 0, (err, result) => {
                        assert.equal(result, 1);

                        commands.lrange("list_pop_create_new34", 0, 1, (err, result) => {
                            assert.deepEqual(result, [0]);
                            done();
                        });
                    });
                });
            });

            describe("#rpushx", () => {
                it("should push item to list", (done) => {
                    commands.rpushx("list_pop_4", 0, (err, result) => {
                        assert.equal(result, 10);
                        commands.rpop("list_pop_4", (err, result) => {
                            assert.equal(result, 0);
                            done();
                        });
                    });
                });

                it("should not insert new element because list does not exist", (done) => {
                    commands.rpushx("random_key_name123", 0, (err, result) => {
                        assert.equal(result, undefined);
                        assert.equal(err, "key does not exist");
                        done();
                    });
                });
            });

            describe("#rpop", () => {
                it("should remove and return last item of list", (done) => {
                    commands.rpop("list_pop_5", (err, result) => {
                        assert.equal(result, 9);
                        commands.llen("list_pop_5", (err, result) => {
                            assert.equal(result, 8);
                            done();
                        });
                    });
                });
            });

            describe("#lrange", () => {
                it("should return empty for non-existing keys", (done) => {
                    commands.lrange("lrange-non-existing", 0, 10, (err, result) => {
                        assert.deepEqual(result, []);
                        done();
                    });
                });

                it("should return range of values in a list", (done) => {
                    commands.lrange("mylist", 0, -1, (err, result) => {
                        assert.deepEqual(result, ["one", "two", "three"]);
                        done();
                    });
                });
            });

            describe("#lset", () => {
                it("should set index of list to value", (done) => {
                    commands.lset("list_pop_5", 3, "new value!", (err, result) => {
                        assert.equal(result, "OK");

                        commands.hget("list_pop_5", "3", (err, result) => {
                            assert.equal(result, "new value!");
                            done();
                        });
                    });
                });
            });

            describe("#lpush", () => {
                it("should insert new element at the beginning of list", (done) => {
                    commands.lpush("list_pop_6", 0, (err, result) => {
                        assert.equal(result, 10);

                        commands.lrange("list_pop_6", 0, 1, (err, result) => {
                            assert.deepEqual(result, [0]);
                            done();
                        });
                    });
                });

                it("should create new list and insert new element at the beginning of list", (done) => {
                    commands.lpush("list_pop_create_new12", 0, (err, result) => {
                        assert.equal(result, 1);

                        commands.lrange("list_pop_create_new12", 0, 1, (err, result) => {
                            assert.deepEqual(result, [0]);
                            done();
                        });
                    });
                });

            });

            describe("#lpushx", () => {
                it("should insert new element at the beginning of list", (done) => {
                    commands.lpushx("list_pop_7", 0, (err, result) => {
                        assert.equal(result, 10);

                        commands.lrange("list_pop_7", 0, 1, (err, result) => {
                            assert.deepEqual(result, [0]);
                            done();
                        });
                    });
                });

                it("should not insert new element because list does not exist", (done) => {
                  commands.lpushx("random_key_name123", 0, (err, result) => {
                      assert.equal(result, undefined);
                      assert.equal(err, "key does not exist");
                      done();
                      });
                  });

            });


        });

        //
        // PUB/SUB
        //
        describe("pub/sub", () => {
            describe("#subscribe", () => {
                it("should allow subscribing to a topic", (done) => {
                    commands.subscribe("channel_name", (data) => {
                        assert.equal(data, "some data");
                        done();
                    });

                    commands.publish("channel_name", "some data");
                });
            });

            describe("#unsubscribe", () => {
                it("should unsubscribe by topic", (done) => {
                    commands.subscribe("channel_to_unsubscribe", (data) => {
                        throw new Error("This callback should never be called.");
                    });

                    commands.unsubscribe("channel_to_unsubscribe")

                    commands.publish("channel_to_unsubscribe", "some data");

                    setTimeout(done, 10);
                });

                it("should unsubscribe by callback", (done) => {
                    let callback = (data) => {
                        throw new Error("This callback should never be called.");
                    };
                    commands.subscribe("channel_to_unsubscribe_2", callback);
                    commands.subscribe("channel_to_unsubscribe_2", (data) => {
                        assert.deepEqual(data, "some data");
                        setTimeout(done, 10);
                    });
                    commands.unsubscribe("channel_to_unsubscribe_2", callback);
                    commands.publish("channel_to_unsubscribe_2", "some data");
                });
            });

            describe("#publish", () => {
                it("should allow sending complex objects", (done) => {
                    const topic = "channel_publish";
                    const testData = {
                        complex: "object",
                        here: true,
                        list: [1,2,3,4,"str"]
                    };

                    commands.subscribe(topic, (data) => {
                        assert.deepEqual(data, testData);
                        commands.unsubscribe(topic);
                        done();
                    });

                    commands.publish(topic, testData);
                });
            });

            describe("#pubsub", () => {
                it("should list processes listening to a topic", (done) => {
                    const topic = "tmp_pubsub_topic";
                    commands.subscribe(topic, (data) => {});
                    commands.subscribe(topic, (data) => {});

                    commands.pubsub(topic, (err, result) => {
                        assert.equal(result.length, 2);
                        done();
                    });
                });
            });
        });

    }

});
