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

