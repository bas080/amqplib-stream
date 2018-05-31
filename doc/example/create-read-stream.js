const amqplib = require('amqplib')
const channel = amqplib.connect('amqp://localhost').then(conn => conn.createChannel())
const {createReadStream, fromQueue} = require('amqplib-stream')

createReadStream({
  channel,
  read: fromQueue('my-queue')
})
