const memshared = require("../lib");

memshared.set("some_key", "hello world!", (err, result) => {
    console.log('SET some_key to "hello world!" => ', result);
});

memshared.subscribe("channel", (data) => {
    console.log("RECEIVED DATA FROM 'channel':", data);
})

setTimeout(() => {
    memshared.get("some_key", (err, data) => console.log("it works:", data));
}, 1000);

setInterval(() => {
    memshared.publish("channel", { hello: "world!" });
}, 1000 + Math.random() * 5000);
