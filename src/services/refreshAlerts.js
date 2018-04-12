const { db: subscriptionDb } = require('../models/subscriptions');
const sendAlertsForRoute = require('./sendAlertsForRoute');
const { filter, map, uniq } = require('lodash');

const refreshAlerts = () => new Promise((resolve, reject) => {
  // Get all the subscriptions.
  subscriptionDb.find({}, (err, subscriptions) => {
    if (err) {
      reject(err);
    } else {
      const routes = uniq(filter(map(subscriptions, 'route')));
      routes.forEach(sendAlertsForRoute);
      resolve({ message: `Sending alerts for ${routes.length} routes`, routes });
    }
  });
});

module.exports = refreshAlerts;
