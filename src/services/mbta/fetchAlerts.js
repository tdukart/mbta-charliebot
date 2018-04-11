const superagent = require('superagent');
const superagentJsonapify = require('superagent-jsonapify');

const { mbtaKey } = require('../../../config');

superagentJsonapify(superagent);

const base = 'https://api-v3.mbta.com';

function fetchAlerts(route) {
  const query = {
    'filter[route]': route
  };
  if (mbtaKey) {
    query.api_key = mbtaKey;
  }

  return superagent.get(`${base}/alerts`)
    .query(query)
    .then((response) => response.body.data);
}

module.exports = fetchAlerts;
