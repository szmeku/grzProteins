const Promise = require('bluebird');
const _ = require('ramda');
const appendToFile = _.flip(_.curryN(2,Promise.promisify(require('fs').appendFile)));

module.exports = {
    appendToFile
};