'use strict';

const {Writable} = require('stream')
const {tryCatch} = require('./helpers')

function createWriteStream(options, streamOptions = {}) {
  const cache = []
  let write;

  const writeStream = new Writable({
    write(msg, encoding, next) {
      // Waiting for channel to resolve
      if (write == null) {
        cache.push([msg, encoding])

        return next()
      }

      write(msg, encoding)
        .then(next, next)
    },
    ...streamOptions
  })

  Promise.resolve(options.channel).then(channel => {
    channel.on('close', () => writeStream.end())
    channel.on('error', error => writeStream.destroy(error))

    write = tryCatch((msg, encoding) => options.write(channel, msg, encoding), error => {
      writeStream.destroy(error)

      return Promise.reject(error)
    })

    return Promise.all(cache.map(writeArgs => write(...writeArgs)))
  })
    .catch(error => writeStream.destroy(error))

  return writeStream
}

module.exports = createWriteStream
