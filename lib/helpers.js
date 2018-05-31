'use strict'

function booleanToPromise(bool) {
  return bool ? Promise.resolve(bool) : Promise.reject(bool)
}


module.exports = {
  booleanToPromise
}
