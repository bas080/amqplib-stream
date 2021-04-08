'use strict'

const {booleanToPromise} = require('../helpers')

module.exports = function toQueue(name) {
  return (channel, content, encoding) => {
    return booleanToPromise(channel.sendToQueue(name, Buffer.from(content), {contentEncoding: encoding}))
  }
}

