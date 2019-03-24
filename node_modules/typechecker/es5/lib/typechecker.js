// Define
'use strict';

var types = ['Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'RegExp', 'String', 'Undefined', 'Object' // deliberately last, as this is a catch all
];

var typeChecker = {

	// -----------------------------------
	// Helpers

	// Get the object type string
	getObjectType: function getObjectType(value) {
		return Object.prototype.toString.call(value);
	},

	// Get the type
	getType: function getType(value) {
		// Cycle
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = types[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var type = _step.value;

				if (typeChecker['is' + type](value)) {
					return type.toLowerCase();
				}
			}

			// Return
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator['return']) {
					_iterator['return']();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return null;
	},

	// -----------------------------------
	// Values

	// Checks to see if a value is an object and only an object
	isPlainObject: function isPlainObject(value) {
		/* eslint no-proto:0 */
		return typeChecker.isObject(value) && value.__proto__ === Object.prototype;
	},

	// Checks to see if a value is empty
	isEmpty: function isEmpty(value) {
		return value == null;
	},

	// Is empty object
	isEmptyObject: function isEmptyObject(value) {
		// We could use Object.keys, but this is more effecient
		for (var key in value) {
			if (value.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	},

	// -----------------------------------
	// Types

	// Checks to see if a value is an object
	isObject: function isObject(value) {
		// null and undefined are objects, hence the truthy check
		return value && typeof value === 'object';
	},

	// Checks to see if a value is an error
	isError: function isError(value) {
		return value instanceof Error;
	},

	// Checks to see if a value is a date
	isDate: function isDate(value) {
		return typeChecker.getObjectType(value) === '[object Date]';
	},

	// Checks to see if a value is an arguments object
	isArguments: function isArguments(value) {
		return typeChecker.getObjectType(value) === '[object Arguments]';
	},

	// Checks to see if a value is a function
	isFunction: function isFunction(value) {
		return typeChecker.getObjectType(value) === '[object Function]';
	},

	// Checks to see if a value is an regex
	isRegExp: function isRegExp(value) {
		return typeChecker.getObjectType(value) === '[object RegExp]';
	},

	// Checks to see if a value is an array
	isArray: function isArray(value) {
		return Array.isArray && Array.isArray(value) || typeChecker.getObjectType(value) === '[object Array]';
	},

	// Checks to see if a valule is a number
	isNumber: function isNumber(value) {
		return typeof value === 'number' || typeChecker.getObjectType(value) === '[object Number]';
	},

	// Checks to see if a value is a string
	isString: function isString(value) {
		return typeof value === 'string' || typeChecker.getObjectType(value) === '[object String]';
	},

	// Checks to see if a valule is a boolean
	isBoolean: function isBoolean(value) {
		return value === true || value === false || typeChecker.getObjectType(value) === '[object Boolean]';
	},

	// Checks to see if a value is null
	isNull: function isNull(value) {
		return value === null;
	},

	// Checks to see if a value is undefined
	isUndefined: function isUndefined(value) {
		return typeof value === 'undefined';
	}
};

// Export
module.exports = typeChecker;