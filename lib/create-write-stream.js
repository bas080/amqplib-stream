'use strict';

const {Writable} = require('stream')

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
        .then(() => next())
        .catch(next)
    },
    ...streamOptions
  })

  options.channel.then(channel => {
    write = options.write.bind(null, channel)
    cache.forEach(writeArgs => write(...writeArgs))
  })
    .catch(error => writeStream.destroy(error))

  return writeStream
}

module.exports = createWriteStream
