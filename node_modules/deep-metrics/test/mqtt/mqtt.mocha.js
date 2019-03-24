/* eslint-env mocha */

'use strict'

process.env.MQQT_URL = process.env.MQQT_URL || 'mqqt://test.mosquitto.org'

const exec = require('child_process').exec
const path = require('path')
const agent = require('../..')
const assert = require('assert')

describe('mqtt', _ => {
  let client

  before('should install deps', done => {
    exec('npm install', {
      env: process.env,
      cwd: path.resolve(__dirname, './2.x/')
    }, done)
  })

  after(done => {
    client.end(done)
  })

  it('should start agent', () => {
    agent.start()
  })

  it('should connect the client', done => {
    require('./2.x/index').init(process.env.MQQT_URL, (_client) => {
      client = _client
      return done()
    })
  })

  it('should subscribe to update and publish message', (done) => {
    client.subscribe('r4frgr:presence')
    client.once('message', function (topic, message) {
      assert(message.toString() === 'Hello mqtt')
      return done()
    })
    client.publish('r4frgr:presence', 'Hello mqtt')
  })

  it('should publish and get metrics about it', (done) => {
    agent.ee.once('mqtt', (data) => {
      data = JSON.parse(data)
      assert(data.method === 'publish')
      assert(data.topic === 'r4frgr:presence')
      return done()
    })
    client.publish('r4frgr:presence', 'Hello mqtt')
  })
})
