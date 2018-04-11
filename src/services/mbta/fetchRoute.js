const superagent = require('superagent');
const superagentJsonapify = require('superagent-jsonapify');
const Datastore = require('nedb');

const { mbtaKey } = require('../../../config');

superagentJsonapify(superagent);

const base = 'https://api-v3.mbta.com';

const routeDb = new Datastore({
  filename: 'data/routes.db',
  autoload: true,
});

const fetchRoute = routeId => new Promise((resolve) => {
  routeDb.findOne({ routeId }, (err, doc) => {
    if (doc) {
      resolve(doc.data);
    }

    const query = {};
    if (mbtaKey) {
      query.api_key = mbtaKey;
    }

    superagent.get(`${base}/routes/${routeId}`)
      .query(query)
      .then(response => response.body.data)
      .then((data) => {
        routeDb.insert({ routeId, data });
        resolve(data);
      });
  });
});

module.exports = fetchRoute;
