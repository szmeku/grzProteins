const _ = require('ramda'),
  {getUntilSuccess} = require('./http'),
  {googleApiKeys: {harmonogramBackendKey}} = require('../config'),
  locationsUrl = 'https://maps.googleapis.com/maps/api/geocode/json',

  locationByAddress = (address) => getUntilSuccess(locationsUrl, {
    address: address,
    key: harmonogramBackendKey

  }).then(_.cond([
    [_.prop('error_message'), (resp) => {
      console.log('LOG: ERROR OCCURRED', resp);
      console.log('LOG: RETRTYING REQUEST');

      return Promise.delay(1000).then(() => locationByAddress(locationsUrl, {
        address: address,
        key: harmonogramBackendKey
      }));
    }],
    [_.T, _.pipe(
      _.tap(resp => console.log('LOG: location fetched', resp.results[0].formatted_address)),
      _.path(['results', '0', 'geometry', 'location']),
    )]
  ]));

module.exports = {
  locationByAddress
};
