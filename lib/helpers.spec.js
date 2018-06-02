'use strict'

const {test} = require('tap')
const {tryCatch} = require('./helpers')

test('should catch the thrown error and reject it', t => {
  const value = 'my-value'
  const error = new Error(value)

  return t.rejects(
    tryCatch(
      () => { throw error },
      (error, firstArg) => {
        t.equals(firstArg, value)

        return Promise.reject(error)
      }
    )(value),
    error
  )
})
