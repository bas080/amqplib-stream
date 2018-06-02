'use strict'

const amqplib = require('amqplib')
const connection = amqplib.connect('amqp://localhost')
const channel = connection.then(conn => conn.createChannel())
const {test} = require('tap')
const {Writable, PassThrough} = require('stream')
const {createWriteStream, createReadStream, toQueue, fromQueue, contentFromQueue, toExchange} = require('./index')
const assert = require('assert')

test('should reset the queues and exchanges', () => channel.then(channel => Promise.all([
  channel.assertQueue('my-queue').then(() => channel.purgeQueue('my-queue')),
  channel.assertQueue('my-bound-queue').then(() => channel.purgeQueue('my-bound-queue')),
  channel.assertExchange('my-exchange', 'direct'),
  channel.bindQueue('my-bound-queue', 'my-exchange', 'my-routing-key'),
])))

test('should write to exchange and read from queue', () => {
  const writeStream = createWriteStream({
    channel,
    write: toExchange('my-exchange', {routingKey: () => 'my-routing-key'})
  })

  const readStream = createReadStream({
    channel,
    read: contentFromQueue('my-bound-queue')
  })

  const items = ['1', '2', '3']

  arrayToStream(items).pipe(writeStream)

  return streamToPromise(readStream.pipe(assertStream(items)))
})

test('should write and read from queue', () => {
  const writeStream = createWriteStream({
    channel,
    write: toQueue('my-queue'),
  })

  const readStream = createReadStream({
    channel,
    read: contentFromQueue('my-queue'),
  })

  const items = ['a', 'b', 'c']

  arrayToStream(items).pipe(writeStream)

  return streamToPromise(readStream.pipe(assertStream(items)))
})

test('should end streams when closing channel and connection', () => {
  // t.todo('write tests that check if streams using these channels will end')
  return channel
    .then(channel => channel.close())
    .then(() => connection)
    .then(connection => connection.close())
})

test('should destroy stream if failed to create channel', t => {
  const error = new Error('amqplib channel error')

  const writeStream = createWriteStream({
    channel: Promise.reject(error),
  })

  writeStream.on('error', streamError => {
    t.equals(error, streamError)

    t.end()
  })
})

test('should destroy write stream when channel is closed', t => {
  const writeStream = createWriteStream({
    channel,
    write: toQueue('my-queue'),
  })

  writeStream.on('error', () => t.end())

  writeStream.write('message-that-triggers-stream-error')
})

test('should destroy read stream when channel is closed', t => {
  const readStream = createReadStream({
    channel,
    read: fromQueue('my-queue'),
  })

  readStream.on('error', () => t.end())
})

// helpers

function arrayToStream(arr, options = {objectMode: true}) {
  const passThrough = new PassThrough(options)

  arr.forEach(item => {
    passThrough.push(item)
  })

  return passThrough
}

function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    stream.once('finish', resolve)
    stream.on('error', reject)
  })
}

function assertStream(items, options = {}) {
  let index = 0

  const stream = new Writable({
    objectMode: true,
    write(item, encoding, next) {
      try {
        assert.equal(items[index], item.toString())
      } catch(err) {
        stream.destroy(err)
      }

      index++

      if (index >= items.length) {
        stream.end()
      }

      next()
    },
    ...options
  })

  return stream
}
