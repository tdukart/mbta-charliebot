const Datastore = require('nedb');
const { filter, keyBy, map } = require('lodash');
const { db: connectionDb } = require('./connections');

const subscriptionDb = new Datastore({
  filename: 'data/subscriptions.db',
  autoload: true,
});

const createSubscription = ({ connectionId, channel, route }) => new Promise((resolve, reject) => {
  subscriptionDb.insert({
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

const removeSubscription = ({ connectionId, channel, route }) => new Promise((resolve, reject) => {
  // eslint-disable-next-line no-underscore-dangle
  subscriptionDb.remove({
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

const findSubscriptionsForRoute = route => new Promise((resolve, reject) => {
  subscriptionDb.find({ route }, (subscriptionErr, subscriptions) => {
    if (subscriptionErr) {
      reject(subscriptionErr);
    } else {
      const connectionIds = map(subscriptions, 'connectionId');
      connectionDb.find({ _id: { $in: connectionIds } }, (connectionErr, connections) => {
        if (connectionErr) {
          reject(connectionErr);
        } else {
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
        }
      });
    }
  });
});

module.exports = {
  db: subscriptionDb,
  createSubscription,
  removeSubscription,
  findSubscriptionsForRoute,
};
