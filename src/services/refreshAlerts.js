const { findAllSubscriptions } = require('../models/subscriptions');
const sendAlertsForRoute = require('./sendAlertsForRoute');
const { filter, map, uniq } = require('lodash');

const refreshAlerts = () => findAllSubscriptions()
  .then((subscriptions) => {
    const routes = uniq(filter(map(subscriptions, 'route')));
    routes.forEach(sendAlertsForRoute);
    return { message: `Sending alerts for ${routes.length} routes`, routes };
  });

module.exports = refreshAlerts;
