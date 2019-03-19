'use strict'

describe('sync', () => {
  it('only returns .env files in the current environment', () => {
    process.env.GAE_SERVICE = 'my-service'
    const { forCurrentEnvironment } = require('../sync')
    expect(forCurrentEnvironment({ name: 'my-service-staging/.env' })).toBe(false)
    expect(forCurrentEnvironment({ name: 'my-service/.env' })).toBe(true)
  })
})
