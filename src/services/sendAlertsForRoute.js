const { WebClient } = require('@slack/client');
const fetchNewAlerts = require('./mbta/fetchNewAlerts');

const { findSubscriptionsForRoute } = require('../models/subscriptions');

const sendAlertsForRoute = routeId => fetchNewAlerts(routeId)
  .then(alerts => findSubscriptionsForRoute(routeId)
    .then((subscriptions) => {
      console.log(`Sending ${alerts.length} alert(s) to ${subscriptions.length} subscriptions.`);
      // For each alert...
      alerts.forEach((alert) => {
        console.log(`Alert: ${alert.text}`);
        // Send to each subscription.
        subscriptions.forEach((subscription) => {
          console.log(`Subscription: ${subscription._id}`);
          const webClient = new WebClient(subscription.botAccessToken);
          webClient.chat.postMessage({
            ...alert,
            channel: subscription.channel,
          });
        });
      });
    }));

module.exports = sendAlertsForRoute;
