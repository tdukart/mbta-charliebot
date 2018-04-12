const superagent = require('superagent');
const superagentJsonapify = require('superagent-jsonapify');

const { mbtaKey } = require('../../../config');

superagentJsonapify(superagent);

const base = 'https://api-v3.mbta.com';

/**
 * Fetches the alerts for a given route.
 * @param {string} routeId The route ID.
 * @returns {Promise<Array>}
 */
function fetchAlerts(routeId) {
  const query = {
    'filter[route]': routeId,
  };
  if (mbtaKey) {
    query.api_key = mbtaKey;
  }

  return superagent.get(`${base}/alerts`)
    .query(query)
    .then(response => response.body.data);
}

module.exports = fetchAlerts;
