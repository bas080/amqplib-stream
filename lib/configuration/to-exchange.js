'use strict'

const {booleanToPromise} = require('../helpers')

const toExchangeDefaultOptions = {
  type: 'direct'
}

module.exports = function toExchange(name, config = {}) {
  const options = {...toExchangeDefaultOptions, ...config}

  return (channel, content, encoding) => {
    return booleanToPromise(channel.publish(name, options.routingKey(content), Buffer.from(content), {contentEncoding: encoding}))
  }
}
