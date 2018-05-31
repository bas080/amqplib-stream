const amqplib = require('amqplib')
const {fromQueue, createReadStream} = require('amqplib-stream')
const {PassThrough} = require('stream')
const channelPromise = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())

channelPromise.then(channel => {
  const ackAll = new PassThrough({objectMode: true})

  ackAll.on('data', msg => channel.ack(msg))

  createReadStream({
    channel: channelPromise,
    read: fromQueue('my-queue')
  }).pipe(ackAll)

})

