'use strict'

module.exports = function fromQueue(name, options = {}) {
  return (channel, write) => channel.consume(name, write, options)
}
