### `createReadStream`

The createReadStream function creates a stream that consumes messages from a
queue. This can be configured with the `fromQueue` configuration helper.

There are also other things that have to do with reading from a queue. One of
them is acking or nacking message(s).

There are two configuration helpers that should make it easy to configure
a read stream.

```js
require ./doc/example/create-read-stream.js
```

#### `fromQueue`

Results in a stream of amqplib messages. These can be used with
`channel.(ack|nack)` or other `amqplib` library features.

```js
require ./doc/example/read-from-queue.js
```

#### `contentFromQueue`

Won't require acking manually. Acking is done as soon as the message is written
to the stream. If you need to manually ack then use `fromQueue` instead.

Reason why is because acking requires a message object. This config function
results in a stream where only the message's content is part of the stream.

#### Custom read configuration

It is also possible to write your own read function.

Let's look at how `fromQueue` is implemented to get a better idea of how to
write your own.

```js
require ./lib/configuration/from-queue.js
```

The `fromQueue` returns a function that complies with the read function
signature that the readable stream expects.

For lack of a better example I could write a configuration function that
basicly consumes and then nacks straight away.

```js
require ./doc/example/custom-read-configuration.js
```

The [write streams](##createWriteStream) also allow you to define [custom write behavior](###Custom write configuration).
