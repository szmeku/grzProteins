'use strict';

let _ = require('ramda'),
    putToList = _.append(_.__, []),
    ifNotListPutInto = _.pipe(
        _.append(_.__, []),
        _.flatten
    ),

// converts ['a', [1,2,3]] to [['a', 1], ['a', 2], ['a', 3]]
// and ['a', 1] to [['a', 1]]
    expandArrayInPair = _.ifElse(
        _.pipe(_.last, _.is(Array)),
        (value) => {
            var array = _.last(value);
            return _.zip(_.repeat(_.head(value), array.length), array)
        },
        putToList
    ),

    commaStringToArray = _.ifElse(
        _.isNil,
        _.always([]),
        _.pipe(
            _.split(','),
            _.map(_.trim)
        )
    ),

    pluckByPath = _.pipe(
        _.path,
        _.map
    ),

    pluckByPaths = _.curry((paths, objects) => {
        return _.map((path) => {
            return pluckByPath(path)(objects);
        }, paths)
    }),

    sortCaseInsensitive = _.sortBy(_.toLower),

    concatAll = _.reduce(_.concat, []),

    lensFind = predicate => {

        let getter = list => _.find(predicate)(list),

            setter = (newValue, list) => {
                let index = _.findIndex(predicate)(list);
                return _.set(_.lensIndex(index), newValue, list);
            };

        return _.lens(getter, setter);
    };

module.exports = {
    putToList,
    ifNotListPutInto,
    expandArrayInPair,
    pluckByPath,
    pluckByPaths,
    commaStringToArray,
    sortCaseInsensitive,
    concatAll,
    lensFind
};
