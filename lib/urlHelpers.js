'use strict';

let _ = require('ramda'),
    {expandArrayInPair} = require('./lists'),
    {isNotNilNeitherEmpty} = require('./objects'),

    objectToUrlParams = _.pipe(
        _.pickBy(isNotNilNeitherEmpty),
        _.toPairs,
        _.reduce((acc, value) => _.concat(acc, expandArrayInPair(value)), []),
        _.map(_.map(encodeURIComponent)),
        _.map(_.join('=')),
        _.join('&')
    ),

    retrieveUrlParams = () => {

        return _.pipe(
            _.tail,
            decodeURIComponent,
            _.split("&"),
            _.map(_.split('=')),
            _.fromPairs
        )(window.location.search);
    },

    replaceLastPathnameElement = (replacement) => window.location.pathname
        .split('/')
        .slice(0, -1)
        .concat([replacement])
        .join('/');


module.exports = {
    objectToUrlParams,
    retrieveUrlParams,
    replaceLastPathnameElement
};

