#!/usr/bin/env node

const process=require('process');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const _ = require('ramda');
const Promise = require('bluebird');
const {appendToFile} = require('./lib/files');
const {promisifyFunction} = require('./lib/functions');
const {inSequenceUntilFirstResolved} = require('./lib/promises');
const {getXMLUntilSuccess} = require('./lib/http');
const parseXML = Promise.promisify(require('xml2js').parseString);
const mapSeries = _.flip(_.curryN(2, Promise.mapSeries));
const promiseMap = _.curryN(3, (options, func, object) => Promise.map(object, func, options));
const argv = require('yargs').argv;
const xlsx = require('node-xlsx');
const ENTRY_NAME_COLUMN_INDEX = 3;

const availableLocations = _.pipe(
    _.juxt([_.identity, _.identity]),
    _.apply(_.zipObj),
    _.mapObjIndexed(() => '')
)(['cytoplasm', 'cytosol', 'nucleus', 'nucleosol', 'nucleoplasm']);

const excelToProteinIdsStrings = _.pipe(
    filePath => xlsx.parse(`${__dirname}/${filePath}`),
    _.path([1, 'data']),
    _.tail,
    _.pluck(ENTRY_NAME_COLUMN_INDEX)
);

const xmlToLocations = _.pipe(
    _.path(['uniprot', 'entry', '0', 'comment']),
    _.filter(_.pathEq(['$', 'type'], 'subcellular location')),
    _.pluck('subcellularLocation'),
    _.flatten,
    _.pluck(['location']),
    _.map(_.pipe(
        _.head,
        _.cond([
            [_.is(String), _.identity],
            [_.T, _.prop('_')]
        ]))),
    _.cond([
        [v => v.length > 0, Promise.resolve],
        [_.T, Promise.reject]
    ])
);

const fetchLocations = _.pipe(
    _.juxt([
        _.pipe(
            (proteinId) => getXMLUntilSuccess(`https://www.uniprot.org/uniprot/${proteinId}.xml`, {}),
            promisifyFunction(parseXML),
            promisifyFunction(xmlToLocations),
            promisifyFunction(_.objOf('locations'))
        ),
        _.objOf('foundById')
    ]),
    Promise.all,
    promisifyFunction(_.mergeAll)
);

const fetchFirstLocations = promisifyFunction(inSequenceUntilFirstResolved(fetchLocations));

const idsStringToLocations = _.pipe(
    (value, index, arrayLength) => [value, index, arrayLength],
    // _.tap(_.cond([
    //     [_.pipe(_.head, _.isNil), (v) => console.log('head is nil!!!', JSON.stringify(v))]
    // ])),
    // _.tap((v) => console.log('head is nil!!!', JSON.stringify(_.tail(v)))),
    _.head,
    _.split(';'),
    fetchFirstLocations,
    promisifyFunction(_.pipe(
        _.juxt([
            _.pickAll(['foundById']),
            _.pipe(
                _.prop('locations'),
                _.defaultTo([]),
                _.map(_.pipe(
                    _.toLower,
                    _.juxt([_.identity, _.always]),
                    _.apply(_.objOf)
                )),
                _.mergeAll,
                _.evolve(_.__, availableLocations)
            )
        ]),
        _.mergeAll
    )),
);

const idStringToIdStringWithLocation = _.pipe(
    _.juxt([
        _.objOf('idsString'),
        _.pipe(idsStringToLocations)
    ]),
    Promise.all,
    promisifyFunction(_.mergeAll)
);


_.pipe(
    excelToProteinIdsStrings,
    promiseMap({concurrency: 30}, _.pipe(
        idStringToIdStringWithLocation,
        promisifyFunction(_.pipe(
            _.values,
            _.append('\n'),
            _.join(','),
            appendToFile(_.__, './data/results.csv'),
            v => {
                v.catch(err => {
                    console.log(err);
                });
                return v;
            }
        ))
    ))
)(argv.xls);

