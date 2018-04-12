const dbConnect = require('../services/dbConnect');

const db = dbConnect('alerts');

const findAlertById = alertId => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.findOne(alertId, (err, alert) => {
      if (err) {
        reject(err);
      } else {
        resolve(alert);
      }
    });
  });
});

const addAlert = alertData => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.insert(alertData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

const updateAlert = (alertId, alertData) => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.update({ _id: alertId }, alertData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

module.exports = { findAlertById, addAlert, updateAlert };
