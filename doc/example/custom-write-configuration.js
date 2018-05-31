/*eslint no-console: "off"*/

module.exports = function fromQueueAndNack(name, options = {}) {
  return (channel, write) => {
    return channel.consume(name, msg => {
      channel.nack(msg)

      write(msg)
        .then(() => console.info('success', msg))
        .catch(console.error)
    }, options)
  }
}
