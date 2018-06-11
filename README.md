# amqplib-stream

A stream interface for amqplib

## Reasoning

Having an interface that uses the nodejs Stream api makes sense when working
with fifo queues. The goal is to have the domain of queues be represented by
streams.

## API

The whole api consist out of two main functions named `createReadStream` and
`createWriteStream`. These can be configured to use a specific connection and/or
channel.

## `createReadStream`

The createReadStream function creates a stream that consumes messages from a
queue. This can be configured with the `fromQueue` configuration helper.

There are also other things that have to do with reading from a queue. One of
them is acking or nacking message(s).

There are two configuration helpers that should make it easy to configure
a read stream.

```js
const amqplib = require('amqplib')
const channel = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())
const {createReadStream, fromQueue} = require('amqplib-stream')

createReadStream({
  channel,
  read: fromQueue('my-queue')
})
```

### `fromQueue`

Results in a stream of amqplib messages. These can be used with
`channel.(ack|nack)` or other `amqplib` library features.

```js
const amqplib = require('amqplib')
const {fromQueue, createReadStream} = require('amqplib-stream')
const {PassThrough} = require('stream')
const channelPromise = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())

const ackAll = new PassThrough({objectMode: true})

channelPromise
  .then(channel => ackAll.on('data', message => channel.ack(message)))

createReadStream({
  channel: channelPromise,
  read: fromQueue('my-queue', {noAck: true})
}).pipe(ackAll)
```

### `contentFromQueue`

Won't require acking manually. Acking is done as soon as the message is written
to the stream. If you need to manually ack then use `fromQueue` instead.

Reason why is because acking requires a message object. This config function
results in a stream where only the message's content is part of the stream.

### Custom read configuration

It is also possible to write your own read function.

Let's look at how `fromQueue` is implemented to get a better idea of how to
write your own.

```js
'use strict'

module.exports = function fromQueue(name, options = {}) {
  return (channel, write) => channel.consume(name, write, options)
}
```

The `fromQueue` returns a function that complies with the read function
signature that the readable stream expects.

For lack of a better example I could write a configuration function that
basicly consumes and then nacks straight away.

```js
module.exports = function fromQueueAndNack(name, options) {
  return (channel, read) => {
    return channel.consume(name, msg => {
      channel.nack(msg)

      read(msg)
    }, options)
  }
}
```

The [write streams](##createWriteStream) also allow you to define [custom write behavior](###Custom write configuration).

## `createWriteStream`

The createWriteStream function creates a stream that publishes to either queues
or exchanges. This can be configured using some predefined configuration
helpers, or by writing your own publish configuration.

Amqplib allows one to publish to exchanges and to send messages to queues.

```js
const amqplib = require('amqplib')
const channel = amqplib.connect('amqp://localhost').createChannel()
const {createWriteStream, toExchange, toQueue} = require('amqplib-stream')

// Publish messages to an exchange
createWriteStream({
  channel,
  publish: toExchange('my-exchange')
})

// Send messages to a queue
createWriteStream({
  channel,
  publish: toQueue('my-queue')
})
```

### toQueue

```js
const amqplib = require('amqplib')
const channelPromise = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())
const {toQueue, createWriteStream} = require('amqplib-stream')

channelPromise.then(() => {
  const myQueueStream = createWriteStream({
    channel: channelPromise,
    write: toQueue('my-queue')
  })

  myQueueStream.write('jenny')
  myQueueStream.write('jake')
  myQueueStream.write('josh')
})

```

### toExchange

```js
const amqplib = require('amqplib')
const {toExchange, createWriteStream} = require('amqplib-stream')
const channelPromise = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())

channelPromise.then(() => {
  const myExchangeStream = createWriteStream({
    channel: channelPromise,
    write: toExchange('my-exchange', {routingKey: () => 'my-routing-key'})
  })

  myExchangeStream.write('jenny')
  myExchangeStream.write('jake')
  myExchangeStream.write('josh')
})

```

Notice how similar the code examples are. The main difference is the
configuration function.

We can also define our own write configuration. Maybe you want to log whenever
a message is being written with succes.

```js
/*eslint no-console: "off"*/

module.exports = function fromQueueAndNack(name, options = {}) {
  return (channel, write) => {
    return channel.consume(name, msg => {
      channel.nack(msg)

      write(msg)
        .then(() => console.info('success', msg))
        .catch(console.error)
    }, options)
  }
}
```

# Tests

The tests require you to have RabbitMQ installed. Consider following the
installation instructions located at
[RabbitMQ](https://www.rabbitmq.com/download.html)

After installing RabbitMQ you can run the tests with `npm test`.

## Coverage

```
-------------------------|----------|----------|----------|----------|-------------------|
File                     |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------|----------|----------|----------|----------|-------------------|
All files                |    95.71 |    76.92 |    94.34 |    96.85 |                   |
 lib                     |    94.92 |       80 |    93.18 |    96.26 |                   |
  create-read-stream.js  |    81.25 |      100 |    71.43 |    85.71 |             19,21 |
  create-write-stream.js |    90.91 |    66.67 |     87.5 |    94.44 |                19 |
  helpers.js             |      100 |       50 |      100 |      100 |                 4 |
  helpers.spec.js        |      100 |      100 |      100 |      100 |                   |
  index.js               |      100 |      100 |      100 |      100 |                   |
  index.spec.js          |    98.41 |      100 |      100 |    98.28 |               124 |
 lib/configuration       |      100 |    66.67 |      100 |      100 |                   |
  content-from-queue.js  |      100 |      100 |      100 |      100 |                   |
  from-queue.js          |      100 |      100 |      100 |      100 |                   |
  index.js               |      100 |      100 |      100 |      100 |                   |
  to-exchange.js         |      100 |        0 |      100 |      100 |                 9 |
  to-queue.js            |      100 |      100 |      100 |      100 |                   |
-------------------------|----------|----------|----------|----------|-------------------|
```

