const _ = require('ramda');
const Promise = require('bluebird');
const {promisifyFunction} = require('./functions');

const inSequenceUntilFirstResolved = _.curryN(2, (func, array) => {

    if(array && array.length === 0){
        return Promise.resolve([]);
    }

    return func(_.head(array)).catch(() => {

        return inSequenceUntilFirstResolved(func, _.tail(array))
    })
});

module.exports = {
    inSequenceUntilFirstResolved
};