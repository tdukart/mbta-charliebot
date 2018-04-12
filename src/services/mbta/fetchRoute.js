const superagent = require('superagent');
const superagentJsonapify = require('superagent-jsonapify');
const Datastore = require('nedb');

const { capitalize } = require('lodash');

const { mbtaKey } = require('../../config');

superagentJsonapify(superagent);

const base = 'https://api-v3.mbta.com';

const routeDb = new Datastore({
  inMemoryOnly: true,
  autoload: true,
});

/**
 * Fetch a route.
 * @param {string} routeId The route ID.
 * @returns {Promise<any>}
 */
const fetchRoute = routeId => new Promise((resolve, reject) => {
  const standardizedId = capitalize(routeId);

  routeDb.findOne({ routeId: standardizedId }, (err, doc) => {
    if (doc) {
      resolve(doc);
      return;
    }

    const query = {};
    if (mbtaKey) {
      query.api_key = mbtaKey;
    }

    superagent.get(`${base}/routes/${standardizedId}`)
      .query(query)
      .then(response => response.body.data)
      .then((data) => {
        const { longName, shortName, type } = data;
        let routeName = longName || shortName;
        if (type === 3) {
          routeName = `Bus ${shortName}`;
        }

        const newDoc = { routeId: standardizedId, routeName, data };
        routeDb.insert(newDoc);
        resolve(newDoc);
      })
      .catch(reject);
  });
});

module.exports = fetchRoute;
