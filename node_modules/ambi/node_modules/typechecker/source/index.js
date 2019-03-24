/* @flow */
/* eslint quote-props:0 */
'use strict'

// Prepare
const isClassRegex = /^class\s|^function\s+[A-Z]/
const isConventionalClassRegex = /^function\s+[A-Z]/
const isNativeClassRegex = /^class\s/

// -----------------------------------
// Values

/**
 * Get the object type string
 * @param {*} value
 * @returns {string}
 */
function getObjectType(value) {
	return Object.prototype.toString.call(value)
}

/**
 * Checks to see if a value is an object
 * @param {*} value
 * @returns {boolean}
 */
function isObject(value) {
	// null is object, hence the extra check
	return value !== null && typeof value === 'object'
}

/**
 * Checks to see if a value is an object and only an object
 * @param {*} value
 * @returns {boolean}
 */
function isPlainObject(value) {
	/* eslint no-proto:0 */
	return isObject(value) && value.__proto__ === Object.prototype
}

/**
 * Checks to see if a value is empty
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {
	return value == null
}

/**
 * Is empty object
 * @param {*} value
 * @returns {boolean}
 */
function isEmptyObject(value /* :Object */) {
	// We could use Object.keys, but this is more effecient
	for (const key in value) {
		if (value.hasOwnProperty(key)) {
			return false
		}
	}
	return true
}

/**
 * Is ES6+ class
 * @param {*} value
 * @returns {boolean}
 */
function isNativeClass(value) {
	// NOTE TO DEVELOPER: If any of this changes, isClass must also be updated
	return (
		typeof value === 'function' && isNativeClassRegex.test(value.toString())
	)
}

/**
 * Is Conventional Class
 * Looks for function with capital first letter MyClass
 * First letter is the 9th character
 * If changed, isClass must also be updated
 * @param {*} value
 * @returns {boolean}
 */
function isConventionalClass(value) {
	return (
		typeof value === 'function' &&
		isConventionalClassRegex.test(value.toString())
	)
}

// There use to be code here that checked for CoffeeScript's "function _Class" at index 0 (which was sound)
// But it would also check for Babel's __classCallCheck anywhere in the function, which wasn't sound
// as somewhere in the function, another class could be defined, which would provide a false positive
// So instead, proxied classes are ignored, as we can't guarantee their accuracy, would also be an ever growing set

// -----------------------------------
// Types

/**
 * Is Class
 * @param {*} value
 * @returns {boolean}
 */
function isClass(value) {
	return typeof value === 'function' && isClassRegex.test(value.toString())
}

/**
 * Checks to see if a value is an error
 * @param {*} value
 * @returns {boolean}
 */
function isError(value) {
	return value instanceof Error
}

/**
 * Checks to see if a value is a date
 * @param {*} value
 * @returns {boolean}
 */
function isDate(value) {
	return getObjectType(value) === '[object Date]'
}

/**
 * Checks to see if a value is an arguments object
 * @param {*} value
 * @returns {boolean}
 */
function isArguments(value) {
	return getObjectType(value) === '[object Arguments]'
}

/**
 * Checks to see if a value is a function but not an asynchronous function
 * @param {*} value
 * @returns {boolean}
 */
function isSyncFunction(value) {
	return getObjectType(value) === '[object Function]'
}

/**
 * Checks to see if a value is an asynchronous function
 * @param {*} value
 * @returns {boolean}
 */
function isAsyncFunction(value) {
	return getObjectType(value) === '[object AsyncFunction]'
}

/**
 * Checks to see if a value is a function
 * @param {*} value
 * @returns {boolean}
 */
function isFunction(value) {
	return isSyncFunction(value) || isAsyncFunction(value)
}

/**
 * Checks to see if a value is an regex
 * @param {*} value
 * @returns {boolean}
 */
function isRegExp(value) {
	return getObjectType(value) === '[object RegExp]'
}

/**
 * Checks to see if a value is an array
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
	return (
		(typeof Array.isArray === 'function' && Array.isArray(value)) ||
		getObjectType(value) === '[object Array]'
	)
}

/**
 * Checks to see if a valule is a number
 * @param {*} value
 * @returns {boolean}
 */
function isNumber(value) {
	return typeof value === 'number' || getObjectType(value) === '[object Number]'
}

/**
 * Checks to see if a value is a string
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {
	return typeof value === 'string' || getObjectType(value) === '[object String]'
}

/**
 * Checks to see if a valule is a boolean
 * @param {*} value
 * @returns {boolean}
 */
function isBoolean(value) {
	return (
		value === true ||
		value === false ||
		getObjectType(value) === '[object Boolean]'
	)
}

/**
 * Checks to see if a value is null
 * @param {*} value
 * @returns {boolean}
 */
function isNull(value) {
	return value === null
}

/**
 * Checks to see if a value is undefined
 * @param {*} value
 * @returns {boolean}
 */
function isUndefined(value) {
	return typeof value === 'undefined'
}

/**
 * Checks to see if a value is a Map
 * @param {*} value
 * @returns {boolean}
 */
function isMap(value) {
	return getObjectType(value) === '[object Map]'
}

/**
 * Checks to see if a value is a WeakMap
 * @param {*} value
 * @returns {boolean}
 */
function isWeakMap(value) {
	return getObjectType(value) === '[object WeakMap]'
}

// -----------------------------------
// General

/**
 * The interface for methods that test for a particular type.
 * @typedef {function} TypeTester
 * @param {*} value the value that will have its type tested
 * @returns {boolean} `true` if the value matches the type that the function tests against
 */

/**
 * The interface for a type mapping (key => function) to use for {@link getType}.
 * The key represents the name of the type. The function represents the {@link TypeTester test method}.
 * The map should be ordered by testing preference, with more specific tests first.
 * If a test returns true, it is selected, and the key is returned as the type.
 * @typedef {Object<string, TypeTester>} TypeMap
 */

/**
 * The default {@link TypeMap} for {@link getType}.
 * AsyncFunction and SyncFunction are missing, as they are more specific types that people can detect afterwards.
 * @readonly
 * @type {TypeMap}
 */
const typeMap = Object.freeze({
	array: isArray,
	boolean: isBoolean,
	date: isDate,
	error: isError,
	class: isClass,
	function: isFunction,
	null: isNull,
	number: isNumber,
	regexp: isRegExp,
	string: isString,
	undefined: isUndefined,
	map: isMap,
	weakmap: isWeakMap,
	object: isObject
})

/**
 * Cycle through the passed {@link TypeMap} testing the value, returning the first type that passes, otherwise `null`.
 * @param {*} value the value to test
 * @param {TypeMap} [customTypeMap] defaults to {@link typeMap}
 * @returns {string|null}
 */
function getType(value, customTypeMap = typeMap) {
	// Cycle through our type map
	for (const key in customTypeMap) {
		if (customTypeMap.hasOwnProperty(key)) {
			if (customTypeMap[key](value)) {
				return key
			}
		}
	}

	// No type was successful
	return null
}

// Export
module.exports = {
	getObjectType,
	isObject,
	isPlainObject,
	isEmpty,
	isEmptyObject,
	isNativeClass,
	isConventionalClass,
	isClass,
	isError,
	isDate,
	isArguments,
	isSyncFunction,
	isAsyncFunction,
	isFunction,
	isRegExp,
	isArray,
	isNumber,
	isString,
	isBoolean,
	isNull,
	isUndefined,
	isMap,
	isWeakMap,
	typeMap,
	getType
}
