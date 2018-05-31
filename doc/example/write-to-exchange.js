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

