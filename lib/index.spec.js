'use strict'

let connection
const amqplib = require('amqplib')
const channel = amqplib.connect('amqp://localhost').then(conn => {
  connection = conn

  return conn.createChannel()
})
const {test} = require('tap')
const {Writable, PassThrough} = require('stream')
const {createWriteStream, createReadStream, toQueue, contentFromQueue, toExchange} = require('./index')
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

test('should close channel and connection', () => {
  return channel
    .then(channel => channel.close())
    .then(() => connection.close())
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
    stream.once('unpipe', resolve)
    stream.once('finish', resolve)
    stream.once('close', resolve)
    stream.once('end', resolve)
    stream.once('error', reject)
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
