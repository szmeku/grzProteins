'use strict';

const NUMBER_REGEXP = /^\-?[\d\.\,\<\>]+$/,
    POSITIVE_NUMBER_REGEXP = /^[\d\.\,\<\>]+$/;
var _ = require('ramda'),
    findAllFirstRegexpGroup = _.curry
    ((regexp, s) => {

        var matches = _.take(2, _.match(regexp)(s)),
            found = _.last(matches),
            rest = _.replace(_.head(matches), '', s);

        if (!found) {
            return [];
        }

        return _.concat(
            [found],
            findAllFirstRegexpGroup(regexp)(rest)
        )
    }),

    filterByRegExp = _.curry((regExp, string) => {

        return _.pipe(
            _.match(regExp),
            _.join('')
        )(string);
    }),

    commaIntegerStringToIntegerList = _.pipe(
        _.split(/[, ]/),
        _.filter(_.complement(_.isEmpty)),
        _.map(Number)
    ),

    booleanFromString = (string) => {

        switch (string) {
            case 'false':
                return false;
                break;
            case 'true':
                return true;
                break;
            default:
                return undefined;
        }
    },

    isNumber = _.curry((mustBePositive, value) => {
        var exp = (mustBePositive) ? POSITIVE_NUMBER_REGEXP : NUMBER_REGEXP;
        return exp.test(value);
    }),

    firstOfCommaString = (string) => {
        if (!_.isNil(string)) {
            var textArray = string.split(",");
            return textArray[0];
        }
        return "";
    },

    createCommaString = (collection) => {
        if (!_.isNil(collection)) {
            return collection.join(', ');
        }
        return "";
    };

module.exports = {
    firstOfCommaString,
    createCommaString,
    findAllFirstRegexpGroup,
    filterByRegExp,
    commaIntegerStringToIntegerList,
    booleanFromString,
    isNumber
};
