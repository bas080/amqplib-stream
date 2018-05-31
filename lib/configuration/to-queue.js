'use strict'

const {booleanToPromise} = require('../helpers')

module.exports = function toQueue(name) {
  return (channel, content, encoding) => {
    return booleanToPromise(channel.sendToQueue(name, new Buffer(content), {contentEncoding: encoding}))
  }
}

