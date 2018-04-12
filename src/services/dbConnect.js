const { MongoClient } = require('mongodb');
const LocalDatastore = require('nedb');

const { mongodbUri } = require('../config');

const connectToDatabase = new Promise((resolve) => {
  if (mongodbUri) {
    MongoClient.connect(mongodbUri, (err, client) => {
      const mongoDb = client.db('charliebot');
      resolve(mongoDb);
    });
  }
  resolve('local');
});

const dbConnect = collectionName => new Promise((resolve) => {
  connectToDatabase.then((db) => {
    if (db === 'local') {
      const datastore = new LocalDatastore({
        filename: `data/${collectionName}.db`,
        autoload: true,
      });
      resolve(datastore);
    } else {
      const collection = db.createCollection(collectionName);
      resolve(collection);
    }
  });
});

module.exports = dbConnect;
