const fetchAlerts = require('./fetchAlerts');
const fetchRoute = require('./fetchRoute');
const parseAlert = require('./parseAlert');
const { filter } = require('lodash');

const { findAlertById, addAlert, updateAlert } = require('../../models/alerts');

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

          findAlertById(alertId)
            .then((doc) => {
              if (!doc || doc.updatedAt !== updatedAt) {
                if (!doc) {
                  addAlert({
                    alertId,
                    route: routeId,
                    updatedAt,
                  }).then(() => {
                    resolve(alert);
                  });
                } else {
                  // eslint-disable-next-line no-underscore-dangle
                  updateAlert(doc._id, {
                    alertId,
                    route: routeId,
                    updatedAt,
                  }).then(() => {
                    resolve(alert);
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
