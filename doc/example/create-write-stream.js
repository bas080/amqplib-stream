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
