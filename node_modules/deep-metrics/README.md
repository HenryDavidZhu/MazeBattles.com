# Appmetrics tuned

```javascript
var monitoring = require('../..').start()
monitoring.ee.on('socketio', function(data) {
  console.log(data)
})
```

## API: Dependency Events (probes)

### Event: 'http'/'https'
Emitted when a HTTP/HTTPS request is made of the application.
* `data` (Object) the data from the HTTP(S) request:
    * `time` (Number) the milliseconds when the request was made. This can be converted to a Date using `new Date(data.time)`.
    * `method` (String) the HTTP(S) method used for the request.
    * `url` (String) the URL on which the request was made.
    * `duration` (Number) the time taken for the HTTP(S) request to be responded to in ms.
    * `header` (String) the response header for the HTTP(S) request.
    * `contentType` (String) the content type of the HTTP(S) request.
    * `requestHeader` (Object) the request header for HTTP(S) request.

### Event: 'http-outbound'/'https-outbound'
Emitted when the application makes an outbound HTTP/HTTPS request.
* `data` (Object) the data from the HTTP(S) request:
    * `time` (Number) the milliseconds when the request was made. This can be converted to a Date using `new Date(data.time)`.
    * `method` (String) the HTTP(S) method used for the request.
    * `url` (String) the URL on which the request was made.
    * `contentType` (String) the HTTP(S) response content-type.
    * `statusCode` (String) the HTTP response status code.
    * `duration` (Number) the time taken for the HTTP(S) request to be responded to in ms.
    * 'requestHeaders' (Object) the HTTP(S) request headers.

### Event: 'leveldown'
Emitted when a LevelDB query is made using the `leveldown` module.
* `data` (Object) the data from the LevelDB query:
    * `time` (Number) the time in milliseconds when the LevelDB query was made. This can be converted to a Date using `new Date(data.time)`.
    * `method` (String) The leveldown method being used.
    * `key` (Object) The key being used for a call to `get`, `put` or `del` (Undefined for other methods)
    * `value` (Object) The value being added to the LevelDB database using the `put` method (Undefined for other methods)
    * `opCount` (Number) The number of operations carried out by a `batch` method (Undefined for other methods)
    * `duration` (Number) the time taken for the LevelDB query to be responded to in ms.

### Event: 'loopback-datasource-juggler'
Emitted when a function is called on the `loopback-datasource-juggler` module
* `data` (Object) the data from the loopback-datasource-juggler event:
    * `time` (Number) the time in milliseconds when the event occurred. This can be converted to a Date using `new Date(data.time)`
    * `method` (String) the function the juggler has executed
    * `duration` (Number) the time taken for the operation to complete.

### Event: 'memcached'
Emitted when a data is stored, retrieved or modified in Memcached using the `memcached` module.
* `data` (Object) the data from the memcached event:
    * `time` (Number) the milliseconds when the memcached event occurred. This can be converted to a Date using `new Date(data.time)`
    * `method` (String) the method used in the memcached client, eg `set`, `get`, `append`, `delete`, etc.
    * `key` (String) the key associated with the data.
    * `duration` (Number) the time taken for the operation on the memcached data to occur.

### Event: 'mongo'
Emitted when a MongoDB query is made using the `mongodb` module.
* `data` (Object) the data from the MongoDB request:
    * `time` (Number) the milliseconds when the MongoDB query was made. This can be converted to a Date using `new Date(data.time)`
    * `query` (String) the query made of the MongoDB database.
    * `duration` (Number) the time taken for the MongoDB query to be responded to in ms.
    * `method` (String) the executed method for the query, such as find, update.
    * `collection` (String) the MongoDB collection name.

### Event: 'mqlight'
Emitted when a MQLight message is sent or received.
* `data` (Object) the data from the MQLight event:
    * `time` (Number) the time in milliseconds when the MQLight event occurred. This can be converted to a Date using new Date(data.time).
    * `clientid` (String) the id of the client.
    * `data` (String) the data sent if a 'send' or 'message', undefined for other calls.  Truncated if longer than 25 characters.
    * `method` (String) the name of the call or event (will be one of 'send' or 'message').
    * `topic` (String) the topic on which a message is sent/received.
    * `qos` (Number) the QoS level for a 'send' call, undefined if not set.
    * `duration` (Number) the time taken in milliseconds.

### Event: 'mqtt'
Emitted when a MQTT message is sent or received.
* `data` (Object) the data from the MQTT event:
    * `time` (Number) the time in milliseconds when the MQTT event occurred. This can be converted to a Date using new Date(data.time).
    * `method` (String) the name of the call or event (will be one of 'publish' or 'message').
    * `topic` (String) the topic on which a message is published or received.
    * `qos` (Number) the QoS level for the message.
    * `duration` (Number) the time taken in milliseconds.

### Event: 'mysql'
Emitted when a MySQL query is made using the `mysql` module.
* `data` (Object) the data from the MySQL query:
    * `time` (Number) the milliseconds when the MySQL query was made. This can be converted to a Date using `new Date(data.time)`.
    * `query` (String) the query made of the MySQL database.
    * `duration` (Number) the time taken for the MySQL query to be responded to in ms.

### Event: 'oracle'
Emitted when a query is executed using the `oracle` module.
* `data` (Object) the data from the Oracle query:
    * `time` (Number) the milliseconds when the Oracle query was made. This can be converted to a Date using `new Date(data.time)`.
    * `query` (String) the query made of the Oracle database.
    * `duration` (Number) the time taken for the Oracle query to be responded to in ms.

### Event: 'oracledb'
Emitted when a query is executed using the `oracledb` module.
* `data` (Object) the data from the OracleDB query:
    * `time` (Number) the milliseconds when the OracleDB query was made. This can be converted to a Date using `new Date(data.time)`.
    * `query` (String) the query made of the OracleDB database.
    * `duration` (Number) the time taken for the OracleDB query to be responded to in ms.

### Event: 'postgres'
Emitted when a PostgreSQL query is made to the `pg` module.
* `data` (Object) the data from the PostgreSQL query:
    * `time` (Number) the milliseconds when the PostgreSQL query was made. This can be converted to a Date using `new Date(data.time)`.
    * `query` (String) the query made of the PostgreSQL database.
    * `duration` (Number) the time taken for the PostgreSQL query to be responded to in ms.

### Event: 'redis'
Emitted when a Redis command is sent.
* `data` (Object) the data from the Redis event:
    * `time` (Number) the time in milliseconds when the redis event occurred. This can be converted to a Date using new Date(data.time).
    * `cmd` (String) the Redis command sent to the server or 'batch.exec'/'multi.exec' for groups of command sent using batch/multi calls.
    * `duration` (Number) the time taken in milliseconds.

### Event: 'riak'
Emitted when a Riak method is called using the `basho-riak-client` module.
* `data` (Object) the data from the Riak event:
    * `time` (Number) the time in milliseconds when the riak event occurred. This can be converted to a Date using new Date(data.time).
    * `method` (String) the Riak method called.
    * `options` (Object) the options parameter passed to Riak.
    * `command` (Object) the command parameter used in the `execute` method.
    * `query` (String) the query parameter used in the `mapReduce` method.
    * `duration` (Number) the time taken in milliseconds.

### Event: 'socketio'
Emitted when WebSocket data is sent or received by the application using socketio.
* `data` (Object) the data from the socket.io request:
    * `time` (Number) the milliseconds when the event occurred. This can be converted to a Date using `new Date(data.time)`.
    * `method` (String) whether the event is a `broadcast` or `emit` from the application, or a `receive` from a client  .
    * `event` (String) the name used for the event.
    * `duration` (Number) the time taken for event to be sent or for a received event to be handled.

### Event: 'strong-oracle'
Emitted when a query is executed using the `strong-oracle` module.
* `data` (Object) the data from the Strong Oracle query:
    * `time` (Number) the milliseconds when the Strong Oracle query was made. This can be converted to a Date using `new Date(data.time)`.
    * `query` (String) the query made of the database.
    * `duration` (Number) the time taken for the Strong Oracle query to be responded to in ms.

## API: Requests

### Event: 'request'
Requests are a special type of event emitted by appmetrics.  All the probes named above can also create request events if requests are enabled.  Howver requests are nested within a root incoming request (usually http). Request events are disabled by default.
* `data` (Object) the data from the request:
    * `time` (Number) the milliseconds when the request occurred. This can be converted to a Date using `new Date(data.time)`.
    * `type` (String) The type of the request event. This is the name of the probe that sent the request data, e.g. `http`, `socketio` etc.
    * `name` (String) The name of the request event. This is the request task, eg. the url, or the method being used.
    * `request` (Object) the detailed data for the root request event:
        * `type` (String) The type of the request event. This is the name of the probe that sent the request data, e.g. `http`, `socketio` etc.
        * `name` (String) The name of the request event. This is the request task, eg. the url, or the method being used.
        * `context` (Object) Additional context data (usually contains the same data as the associated non-request metric event).
        * `stack` (String) An optional stack trace for the event call.
        * `children` (Array) An array of child request events that occurred as part of the overall request event. Child request events may include function trace entries, which will have a `type` of null.
        * `duration` (Number) the time taken for the request to complete in ms.
    * `duration` (Number) the time taken for the overall request to complete in ms.
