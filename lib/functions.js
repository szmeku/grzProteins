'use strict';

let _ = require('ramda');

let promisifyFunction = function (func) {

    return function () {
      let that = this,
      // IE10 fix (in IE10 Promise.all(arguments) neither Array.from(arguments) doesn't work
        args = Array.from ? Array.from(arguments) : _.map(_.identity, arguments);

      return Promise.all(args).then(function (resolvedArguments) {
        return func.apply(that, resolvedArguments);
      });
    };
  },

  debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments,
        later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        },
        callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  callOn = _.curry((methodName, args, object) => {
    return object[methodName].apply(object, args);
  }),

  curryNAndPromisifyFunction = (arity, f) => _.curryN(arity, promisifyFunction(f));

module.exports = {
  promisifyFunction,
  curryNAndPromisifyFunction,
  debounce,
  callOn
};
