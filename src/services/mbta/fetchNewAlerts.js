const fetchAlerts = require('./fetchAlerts');
const fetchRoute = require('./fetchRoute');
const parseAlert = require('./parseAlert');
const { filter } = require('lodash');

const { db: alertsDb } = require('../../models/alerts');

/**
 * Fetches all the new alerts for a route.
 * @param {string} routeId
 * @returns {Promise<Array>}
 */
const fetchNewAlerts = routeId => fetchRoute(routeId)
  .then(({ longName, shortName, type }) => {
    let routeName = longName || shortName;
    if (type === 3) {
      routeName = `Bus ${shortName}`;
    }
    return fetchAlerts(routeId)
      .then((alerts) => {
        const alertPromises = alerts.map(alert => new Promise((resolve) => {
          const { id: alertId, updated_at: updatedAt } = alert;
          alertsDb.findOne({ alertId, route: routeId }, (err, doc) => {
            if (!doc || doc.updatedAt !== updatedAt) {
              if (!doc) {
                alertsDb.insert({
                  alertId,
                  route: routeId,
                  updatedAt,
                });
              } else {
                // eslint-disable-next-line no-underscore-dangle
                alertsDb.update(doc._id, {
                  alertId,
                  route: routeId,
                  updatedAt,
                });
              }
              resolve(alert);
            } else {
              resolve(null);
            }
          });
        }));

        return Promise.all(alertPromises);
      })
      .then(alerts => filter(alerts))
      .then(alerts => alerts.map(alert => parseAlert(routeName, alert)));
  });
module.exports = fetchNewAlerts;
