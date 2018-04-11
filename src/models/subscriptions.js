const Datastore = require('nedb');

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
  subscriptionDb.find({ route }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

module.exports = { createSubscription, removeSubscription, findSubscriptionsForRoute };
