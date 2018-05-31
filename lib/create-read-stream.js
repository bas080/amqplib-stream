'use strict'

const {PassThrough} = require('stream')

function createReadStream(options, streamOptions = {}) {
  const passThrough = new PassThrough({
    objectMode: true,
    ...streamOptions
  })

  options.channel
    .then(channel => {
      return options.read(channel, msg => {
        try {
          passThrough.write(msg)
        } catch(err) {
          channel.nack(msg)

          throw err
        }
      })
    })
    .catch(error => passThrough.destroy(error))

  return passThrough
}

module.exports = createReadStream
