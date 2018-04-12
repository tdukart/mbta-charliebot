const { filter, keyBy, map } = require('lodash');

const dbConnect = require('../services/dbConnect');
const { findConnectionsById } = require('./connections');

const db = dbConnect('subscriptions');

const createSubscription = ({ connectionId, channel, route }) => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.insert({
      connectionId,
      channel,
      route,
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
});

const removeSubscription = ({ connectionId, channel, route }) => new Promise((resolve, reject) => {
  db.then((collection) => {
    // eslint-disable-next-line no-underscore-dangle
    collection.remove({
      connectionId,
      channel,
      route,
    }, (removeErr, removeData) => {
      if (removeErr) {
        reject(removeErr);
      } else {
        resolve(removeData);
      }
    });
  });
});

const findAllSubscriptions = () => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.find({}, (subscriptionErr, subscriptions) => {
      if (subscriptionErr) {
        reject(subscriptionErr);
      } else {
        resolve(subscriptions);
      }
    });
  });
});

const findSubscriptionsForRoute = route => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.find({ route }, (subscriptionErr, subscriptions) => {
      if (subscriptionErr) {
        reject(subscriptionErr);
      } else {
        const connectionIds = map(subscriptions, 'connectionId');
        findConnectionsById(connectionIds).then((connections) => {
          const keyedConnections = keyBy(connections, '_id');
          const joinedSubscriptions = filter(map(subscriptions, (subscription) => {
            const connection = keyedConnections[subscription.connectionId];
            if (!connection) {
              // eslint-disable-next-line no-underscore-dangle,no-console
              console.error('No connection found for subscription', subscription._id);
              return false;
            }
            return ({
              botAccessToken: connection.bot.bot_access_token,
              ...subscription,
            });
          }));

          resolve(joinedSubscriptions);
        });
      }
    });
  });
});

module.exports = {
  createSubscription,
  removeSubscription,
  findAllSubscriptions,
  findSubscriptionsForRoute,
};
