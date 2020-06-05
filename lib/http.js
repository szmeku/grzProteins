'use strict';

const fetch = require('node-fetch'),
    Promise = require('bluebird'),
    _ = require('ramda'),
    querystring = require('querystring'),
    {objectToUrlParams} = require('./urlHelpers'),

    encodeParamsAsFormUrlAndPost = _.curryN(2, (url, params) => {

        return fetch(url, _.merge({
            credentials: 'same-origin',
            method: 'post',
            body: querystring.stringify(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }, params))
            .then(resp => {
                if (resp.status === 200) {
                    return resp
                }
            })
    }),

    getXMLUntilSuccess = _.curryN(2, (url, params) => {

        let urlWithParams = _.pipe(
            _.filter(_.complement(_.isNil)),
            _.join('?')
        )([url, objectToUrlParams(params)]);

        return fetch(urlWithParams, {credentials: 'same-origin'})
            .then(resp => {
                if (resp.status === 200) {
                    return resp.text();
                }

                return Promise.reject(resp);
            })

            .catch((err) => {
                if (err.status === 404) {
                    return Promise.resolve(err);
                }
                console.log('Log: HTTP ERROR OCCURRED', err);
                console.log('LOG: RETRYING REQUEST');

                return getXMLUntilSuccess(url, params);
            })
    });

module.exports = {
    encodeParamsAsFormUrlAndPost,
    getXMLUntilSuccess
};
