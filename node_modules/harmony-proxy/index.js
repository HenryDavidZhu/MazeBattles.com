/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
/*global Proxy:true */
"use strict";

// We need to have at least old-style Proxies
if (typeof Proxy === 'undefined')
	throw new Error('Native proxies not enabled. use `node --harmony-proxies` to enable them.');

// Check if we actually have new-style Proxies
module.exports = typeof Proxy.create !== 'function' ? Proxy : ProxyShim;

// Keep local reference in case global reference is overwritten
var OldProxy = Proxy;

function ProxyShim(target, handler) {
	// this code is mostly copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Old_Proxy_API
	var oldHandler = {
		// Fundamental traps
		getOwnPropertyDescriptor: function (name) {
			if (handler.getOwnPropertyDescriptor)
				return handler.getOwnPropertyDescriptor(target, name);
			var desc = Object.getOwnPropertyDescriptor(target, name);
			// a trapping proxy's properties must always be configurable
			if (desc !== undefined) { desc.configurable = true; }
			return desc;
		},
		getPropertyDescriptor: function (name) {
			var proto = target;
			var desc;
			do {
				desc = Object.getOwnPropertyDescriptor(proto, name);
			} while (desc === undefined && (proto = Object.getPrototypeOf(proto)));
			// a trapping proxy's properties must always be configurable
			if (desc !== undefined) { desc.configurable = true; }
			return desc;
		},
		getOwnPropertyNames: function (name) {
			if (handler.getOwnPropertyNames)
				return handler.getOwnPropertyNames(target, name);
			return Object.getOwnPropertyNames(target);
		},
		getPropertyNames: function () {
			var names = [];
			var proto = target;
			do {
				names = names.concat(Object.getOwnPropertyNames(proto));
			} while ((proto = Object.getPrototypeOf(proto)) && proto !== Object.prototype);
			return names;
		},
		defineProperty: function (name, desc) {
			if (handler.defineProperty)
				return handler.defineProperty(target, name, desc);
			return Object.defineProperty(target, name, desc);
		},
		delete: function (name) {
			if (handler.deleteProperty)
				return handler.deleteProperty(target, name);
			return delete target[name];
		},
		/* TODO: freeze, seal, preventExtensions
		fix: function() {
			if (Object.isFrozen(obj)) {
				return Object.getOwnPropertyNames(obj).map(function(name) {
					return Object.getOwnPropertyDescriptor(obj, name);
				});
			}
			// As long as obj is not frozen, the proxy won't allow itself to be fixed
			return undefined; // will cause a TypeError to be thrown
		},*/
	};
	// derived traps
	if (handler.has)
		oldHandler.has = function (name) {
			return handler.has(target, name);
		};
	if (handler.hasOwn)
		oldHandler.hasOwn = function (name) {
			return handler.hasOwn(target, name);
		};
	if (handler.get)
		oldHandler.get = function (receiver, name) {
			return handler.get(target, name, receiver);
		};
	if (handler.set)
		oldHandler.set = function (receiver, name, val) {
			return handler.set(target, name, val, receiver);
		};
	if (handler.enumerate)
		oldHandler.enumerate = function () {
			return handler.enumerate(target);
		};
	if (handler.keys)
		oldHandler.keys = function() {
			return handler.keys(target);
		};

	if (typeof target !== 'function')
		return OldProxy.create(oldHandler, Object.getPrototypeOf(target));
	return OldProxy.createFunction(
		oldHandler,
		function () {
			if (handler.apply)
				return handler.apply(target, this, Array.prototype.slice.call(arguments));
			return target.apply(this, Array.prototype.slice.call(arguments));
		},
		handler.construct && function () {
			return handler.construct(target, Array.prototype.slice.call(arguments));
		}
	);
}

