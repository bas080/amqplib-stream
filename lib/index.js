'use strict'

module.exports = {
  createReadStream: require('./create-read-stream'),
  createWriteStream: require('./create-write-stream'),
  ...require('./configuration')
}
