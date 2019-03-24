'use strict';

var assert = require('assert');
var parseInterval = require('./').default;

describe('Parser', function () {

	describe('should return null if', function () {

		it('input is invalid', function () {
			assert.equal(null, parseInterval('INVALID INPUT'));
			assert.equal(null, parseInterval('1,2'));
			assert.equal(null, parseInterval('[]'));
			assert.equal(null, parseInterval(']['));
		});

		it('left value more than right value', function () {
			assert.equal(null, parseInterval('[2,-2]'));
			assert.equal(null, parseInterval('[Infinity,-2]'));
			assert.equal(null, parseInterval('[1,-Infinity]'));
		});

		it('value equals, but not included to interval', function () {
			assert.equal(null, parseInterval('[2,2)'));
			assert.equal(null, parseInterval('(2,2]'));
			assert.equal(null, parseInterval('[2,2['));
			assert.equal(null, parseInterval(']2,2]'));
			assert.equal(null, parseInterval('(2,2)'));
			assert.equal(null, parseInterval(']2,2['));
			assert.equal(null, parseInterval('(2)'));
			assert.equal(null, parseInterval(']2['));
			assert.equal(null, parseInterval('(Infinity,Infinity]'));
		});

	});

	describe('should right work', function () {

		it('in full form', function () {
			assert.deepEqual({
				from: {
					value: -10,
					included: true
				},
				to: {
					value: 10,
					included: false
				}
			}, parseInterval('[-10,10)'));
		});

		it('in not full form', function () {
			assert.deepEqual({
				from: {
					value: 10,
					included: true
				},
				to: {
					value: 10,
					included: true
				}
			}, parseInterval('[10]'));

			assert.deepEqual({
				from: {
					value: 10,
					included: true
				},
				to: {
					value: Infinity,
					included: true
				}
			}, parseInterval('[10,]'));

			assert.deepEqual({
				from: {
					value: -Infinity,
					included: true
				},
				to: {
					value: 10,
					included: true
				}
			}, parseInterval('[,10]'));

			assert.deepEqual({
				from: {
					value: -Infinity,
					included: true
				},
				to: {
					value: Infinity,
					included: true
				}
			}, parseInterval('[,]'));

		});

	});

});
