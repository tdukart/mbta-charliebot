const Datastore = require('nedb');
const filter = require('lodash/filter');

const fetchAlerts = require('./services/mbta/fetchAlerts');
const fetchRoute = require('./services/mbta/fetchRoute');
const parseAlert = require('./services/mbta/parseAlert');

class CharlieBot {
  constructor() {
    this.init();
  }

  init() {
    this.routeNames = {};
    this.alertsDb = new Datastore({
      filename: 'data/alerts.db',
      autoload: true,
    });
  }

  fetch(route) {
    const { alertsDb } = this;

    return fetchRoute(route)
      .then(({ longName, shortName, type }) => {
        let routeName = longName || shortName;
        if (type === 3) {
          routeName = `Bus ${shortName}`;
        }
        return fetchAlerts(route)
          .then((alerts) => {
            const alertPromises = alerts.map(alert => new Promise((resolve) => {
              const { id: alertId, updated_at: updatedAt } = alert;
              alertsDb.findOne({ alertId, route }, (err, doc) => {
                if (!doc || doc.updatedAt !== updatedAt) {
                  if (!doc) {
                    alertsDb.insert({
                      alertId, route, alert, updatedAt,
                    });
                  } else {
                    // eslint-disable-next-line no-underscore-dangle
                    alertsDb.update(doc._id, {
                      alertId, route, alert, updatedAt,
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
  }
}

module.exports = CharlieBot;
