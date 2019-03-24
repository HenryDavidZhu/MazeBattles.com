/* eslint-env mocha */

'use strict'

process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/test'

const exec = require('child_process').exec
const path = require('path')
const agent = require('../..')
const Plan = require('../plan')
const assert = require('assert')

describe('mongoose', _ => {
  describe('v4', _ => {
    let mongoose
    let Simple

    before('should install deps', done => {
      exec('npm install', {
        env: process.env,
        cwd: path.resolve(__dirname, './4.x/')
      }, done)
    })

    after(() => {
      if (mongoose) {
        mongoose.disconnect()
      }
    })

    it('should start agent', () => {
      agent.start()
    })

    it('should connect the client', done => {
      require('./4.x/index').init(process.env.MONGO_URL, (err, _client) => {
        if (err) return done(err)
        mongoose = _client
        return done()
      })
    })

    it('should create a schema and save a doc', (done) => {
      var Schema = mongoose.Schema
      var simpleSchema = new Schema({
        f1: String,
        f2: Boolean,
        f3: Number
      })

      Simple = mongoose.model('Simple', simpleSchema)
      var sim = new Simple({
        f1: 'sim',
        f2: true,
        f3: 42
      })
      sim.save(done)
    })

    it('should see query with agent', done => {
      let plan = new Plan(2, done)
      agent.ee.once('mongo', (data) => {
        data = JSON.parse(data)
        assert(data.method === 'findOne')
        assert(data.collection === 'simples')
        plan.ok()
      })

      Simple.findOne({ f1: 'sim' }, (err, doc) => {
        if (err) return done(err)
        plan.ok(doc.f1 === 'sim')
      })
    })
  })

  describe('v5', _ => {
    let mongoose
    let Simple

    before('should install deps', done => {
      exec('npm install', {
        env: process.env,
        cwd: path.resolve(__dirname, './5.x/')
      }, done)
    })

    after(() => {
      if (mongoose) {
        mongoose.disconnect()
      }
    })

    it('should start agent', () => {
      agent.start()
    })

    it('should connect the client', done => {
      require('./5.x/index').init(process.env.MONGO_URL, (err, _client) => {
        if (err) return done(err)
        mongoose = _client
        return done()
      })
    })

    it('should create a schema and save a doc', (done) => {
      var Schema = mongoose.Schema
      var simpleSchema = new Schema({
        f1: String,
        f2: Boolean,
        f3: Number
      })

      Simple = mongoose.model('Simple', simpleSchema)
      var sim = new Simple({
        f1: 'sim2',
        f2: true,
        f3: 42
      })
      sim.save(done)
    })

    it('should see query with agent', done => {
      let plan = new Plan(2, done)
      agent.ee.once('mongo', (data) => {
        data = JSON.parse(data)
        assert(data.method === 'findOne')
        assert(data.collection === 'simples')
        plan.ok()
      })

      Simple.findOne({ f1: 'sim2' }, (err, doc) => {
        if (err) return done(err)
        plan.ok(doc.f1 === 'sim2')
      })
    })
  })
})
