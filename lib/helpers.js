'use strict'

function booleanToPromise(bool) {
  return bool ? Promise.resolve(bool) : Promise.reject(bool)
}

function tryCatch(tryFn, catchFn) {
  return (...args) => {
    let value

    try {
      value = tryFn(...args)
    } catch(error) {
      value = catchFn(error, ...args)
    }

    return value
  }
}

module.exports = {
  booleanToPromise,
  tryCatch,
}
