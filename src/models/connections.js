const dbConnect = require('../services/dbConnect');

const db = dbConnect('connections');

const getAllConnections = () => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.find({}, (err, connections) => {
      if (err) {
        reject(err);
      } else {
        resolve(connections);
      }
    });
  });
});

const addConnection = connectionData => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.insert(connectionData, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
});

const findConnectionsById = connectionIds => new Promise((resolve, reject) => {
  db.then((collection) => {
    collection.find({ _id: { $in: connectionIds } }, (err, connections) => {
      if (err) {
        reject(err);
      } else {
        resolve(connections);
      }
    });
  });
});

module.exports = {
  getAllConnections,
  addConnection,
  findConnectionsById,
};
