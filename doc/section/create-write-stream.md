## `createWriteStream`

The createWriteStream function creates a stream that publishes to either queues
or exchanges. This can be configured using some predefined configuration
helpers, or by writing your own publish configuration.

Amqplib allows one to publish to exchanges to send messages to queues.

```js
require ./doc/example/create-write-stream.js
```

### toQueue

```js
require ./doc/example/write-to-queue.js
```

### toExchange

```js
require ./doc/example/write-to-exchange.js
```

Notice how similar the code examples are. The main difference is the
configuration function.

We can also define our own write configuration. Maybe you want to log whenever
a message is being written with succes.

```js
require  ./doc/example/custom-write-configuration.js
```
