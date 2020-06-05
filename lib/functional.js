const _ = require('ramda'),
  Promise = require('bluebird'),

  map = _.curryN(3, (options, func, items) => Promise.map(items, func, options));

module.exports = {
  map
};
