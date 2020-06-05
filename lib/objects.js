'use strict';

let _ = require('ramda'),

    isNotNilNeitherEmpty = _.allPass([_.complement(_.isNil), _.complement(_.isEmpty)]),

    nilOrEmpty = _.anyPass([_.isNil, _.isEmpty]),

    renameKey = _.curry((newKey, oldKey, object) => {

        return _.pipe(
            _.assoc(newKey, object[oldKey]),
            _.omit([oldKey])
        )(object);
    }),

    renameObjKeys = _.curry(function (mappingObj, obj) {

        return _.pipe(
            _.props(_.keys(mappingObj)),
            _.zipObj(_.values(mappingObj)),
            _.merge(_.omit(_.keys(mappingObj), obj))
        )(obj);
    }),

    headKey = _.pipe(
        _.keys,
        _.head
    ),

    head = (object) => {
        let key = headKey(object),
            value = object[key];

        return {key, value};
    },

    tail = (object) => _.omit(headKey(object), object),

    prop = _.curry((path, object) => _.pipe(
        _.path(path.split('.'))
    )(object)),

    has = _.curry((path, object) => _.pipe(
        prop(path),
        _.complement(_.isNil)
    )(object)),

    toUrlParams = _.pipe(
        _.pickBy(isNotNilNeitherEmpty),
        _.toPairs,
        _.reduce((acc, value) => _.concat(acc, expandArrayInPair(value)), []),
        _.map(_.join('=')),
        _.join('&')
    ),

    propInCollection = _.curry((propertyName, collection, object) => _.contains(prop(propertyName, object), collection)),

    paths = _.curry((paths, object) => _.map(path => _.path(path, object), paths)),

    filterByProperty = _.curry((propertyName, allowedValues, array) => _.filter(propInCollection(propertyName, allowedValues), array)),

    objectHasAnyValue = _.pipe(
        _.values,
        _.any(_.allPass([_.complement(_.isNil), _.complement(_.isEmpty)]))
    ),

    objectHasNoValues = _.complement(objectHasAnyValue),

    hasNot = _.complement(_.has),

    concatValues = _.pipe(
        _.values,
        _.reduce(_.concat, [])
    ),

    addPrefixToHead = (prefix) => {
        return _.over(_.lensIndex(0), _.concat(prefix));
    },

    addPrefixToKeys = _.curry((prefix, object) => {

        return _.pipe(
            _.toPairs,
            _.map(addPrefixToHead(prefix)),
            _.fromPairs
        )(object);
    });

module.exports = {
    renameKey,
    renameObjKeys,
    headKey,
    head,
    tail,
    prop,
    has,
    toUrlParams,
    paths,
    propInCollection,
    isNotNilNeitherEmpty,
    nilOrEmpty,
    filterByProperty,
    objectHasAnyValue,
    objectHasNoValues,
    hasNot,
    concatValues,
    addPrefixToKeys
};
