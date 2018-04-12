const { WebClient } = require('@slack/client');
const fetchNewAlerts = require('./mbta/fetchNewAlerts');

const { findSubscriptionsForRoute } = require('../models/subscriptions');

const sendAlertsForRoute = routeId => fetchNewAlerts(routeId)
  .then(alerts => findSubscriptionsForRoute(routeId)
    .then((subscriptions) => {
      // For each alert...
      alerts.forEach((alert) => {
        // Send to each subscription.
        subscriptions.forEach((subscription) => {
          const webClient = new WebClient(subscription.botAccessToken);
          webClient.chat.postMessage({
            ...alert,
            channel: subscription.channel,
          });
        });
      });
    }));

module.exports = sendAlertsForRoute;
