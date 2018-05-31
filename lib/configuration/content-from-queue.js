'use strict'

const fromQueue = require('./from-queue')

const contentFromQueueDefaultOptions = {
  noAck: true
}

module.exports =  function contentFromQueue(name, config = {}) {
  const options = {...contentFromQueueDefaultOptions, ...config}
  const fn = fromQueue(name, options)

  return (channel, write) => fn(channel, msg => {
    return write(msg.content)
  })
}
