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
