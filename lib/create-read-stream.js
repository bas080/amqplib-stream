'use strict'

const {PassThrough} = require('stream')
const {tryCatch} = require('./helpers')

function createReadStream(options, streamOptions = {}) {
  const passThrough = new PassThrough({
    objectMode: true,
    ...streamOptions
  })

  Promise.resolve(options.channel).then(channel => {
    channel.on('close', () => passThrough.end())
    channel.on('error', error => passThrough.destroy(error))

    const read = tryCatch(
      msg => passThrough.write(msg),
      (error, msg) => {
        channel.nack(msg)

        throw error
      }
    )

      return options.read(channel, read)
    })
    .catch(error => passThrough.destroy(error))

  return passThrough
}

module.exports = createReadStream
