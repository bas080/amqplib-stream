module.exports = function fromQueueAndNack(name, options) {
  return (channel, read) => {
    return channel.consume(name, msg => {
      channel.nack(msg)

      read(msg)
    }, options)
  }
}
