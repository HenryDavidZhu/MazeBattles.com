/* @flow */
'use strict';

// Import

var pathUtil = require('path');
var ignorePatterns /* :RegExp */ = require('ignorepatterns');

/* ::
type IgnoreOpts = {
	ignorePaths?: false | Array<string>,
	ignoreHiddenFiles?: boolean,
	ignoreCommonPatterns?: boolean | RegExp,
	ignoreCustomPatterns?: false | RegExp
}
*/

/**
Is Ignored Path
Check to see if a path, either a full path or basename, should be ignored
@param {string} path - a full path or basename of a file or directory
@param {object} [opts] - configurations options
@param {false | Array<string>} [opts.ignorePaths] - an optional listing of full paths to ignore
@param {boolean} [opts.ignoreHiddenFiles] - whether or not to ignore basenames beginning with a "." character
@param {boolean} [opts.ignoreCommonPatterns] - if true, will check the path and basename of the path against https://github.com/bevry/ignorepatterns
@param {false | RegExp} [opts.ignoreCustomPatterns] - if a regular expression, will test the regular expression against the path and basename of the path
@returns {boolean} whether or not the path should be ignored
*/
function isIgnoredPath(path /* :string */) {
	var opts /* :IgnoreOpts */ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	// Prepare
	var basename = pathUtil.basename(path);

	// Test Paths
	if (opts.ignorePaths) {
		for (var i = 0; i < opts.ignorePaths.length; ++i) {
			var ignorePath = opts.ignorePaths[i];
			if (path.indexOf(ignorePath) === 0) {
				return true;
			}
		}
	}

	// Test Hidden Files
	if (opts.ignoreHiddenFiles && basename[0] === '.') {
		return true;
	}

	// Test Common Patterns
	if (opts.ignoreCommonPatterns == null || opts.ignoreCommonPatterns === true) {
		return ignorePatterns.test(path) || path !== basename && ignorePatterns.test(basename);
	} else if (opts.ignoreCommonPatterns) {
		var ignoreCommonPatterns /* :RegExp */ = opts.ignoreCommonPatterns;
		return ignoreCommonPatterns.test(path) || path !== basename && ignoreCommonPatterns.test(basename);
	}

	// Test Custom Patterns
	if (opts.ignoreCustomPatterns) {
		var ignoreCustomPatterns /* :RegExp */ = opts.ignoreCustomPatterns;
		return ignoreCustomPatterns.test(path) || path !== basename && ignoreCustomPatterns.test(basename);
	}

	// Return
	return false;
}

// Export
module.exports = { isIgnoredPath: isIgnoredPath };