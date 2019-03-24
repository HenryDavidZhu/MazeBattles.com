// Define
const types = [
	'Array',
	'Boolean',
	'Date',
	'Error',
	'Function',
	'Null',
	'Number',
	'RegExp',
	'String',
	'Undefined',
	'Object'  // deliberately last, as this is a catch all
]

const typeChecker = {

	// -----------------------------------
	// Helpers

	// Get the object type string
	getObjectType: function (value) {
		return Object.prototype.toString.call(value)
	},

	// Get the type
	getType: function (value) {
		// Cycle
		for ( let type of types ) {
			if ( typeChecker['is' + type](value) ) {
				return type.toLowerCase()
			}
		}

		// Return
		return null
	},

	// -----------------------------------
	// Values

	// Checks to see if a value is an object and only an object
	isPlainObject: function (value) {
		/* eslint no-proto:0 */
		return typeChecker.isObject(value) && value.__proto__ === Object.prototype
	},

	// Checks to see if a value is empty
	isEmpty: function (value) {
		return value == null
	},

	// Is empty object
	isEmptyObject: function (value) {
		// We could use Object.keys, but this is more effecient
		for ( let key in value ) {
			if ( value.hasOwnProperty(key) ) {
				return false
			}
		}
		return true
	},

	// -----------------------------------
	// Types

	// Checks to see if a value is an object
	isObject: function (value) {
		// null and undefined are objects, hence the truthy check
		return value && typeof value === 'object'
	},

	// Checks to see if a value is an error
	isError: function (value) {
		return value instanceof Error
	},

	// Checks to see if a value is a date
	isDate: function (value) {
		return typeChecker.getObjectType(value) === '[object Date]'
	},

	// Checks to see if a value is an arguments object
	isArguments: function (value) {
		return typeChecker.getObjectType(value) === '[object Arguments]'
	},

	// Checks to see if a value is a function
	isFunction: function (value) {
		return typeChecker.getObjectType(value) === '[object Function]'
	},

	// Checks to see if a value is an regex
	isRegExp: function (value) {
		return typeChecker.getObjectType(value) === '[object RegExp]'
	},

	// Checks to see if a value is an array
	isArray: function (value) {
		return Array.isArray && Array.isArray(value) || typeChecker.getObjectType(value) === '[object Array]'
	},

	// Checks to see if a valule is a number
	isNumber: function (value) {
		return typeof value === 'number' || typeChecker.getObjectType(value) === '[object Number]'
	},

	// Checks to see if a value is a string
	isString: function (value) {
		return typeof value === 'string' || typeChecker.getObjectType(value) === '[object String]'
	},

	// Checks to see if a valule is a boolean
	isBoolean: function (value) {
		return value === true || value === false || typeChecker.getObjectType(value) === '[object Boolean]'
	},

	// Checks to see if a value is null
	isNull: function (value) {
		return value === null
	},

	// Checks to see if a value is undefined
	isUndefined: function (value) {
		return typeof value === 'undefined'
	}
}


// Export
module.exports = typeChecker
