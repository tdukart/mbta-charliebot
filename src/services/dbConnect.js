const { MongoClient } = require('mongodb');

const { mongodbUri } = require('../config');

const connectToDatabase = MongoClient.connect(mongodbUri);

const dbConnect = collectionName => connectToDatabase.then(client => (
  client.db().createCollection(collectionName)
));

module.exports = dbConnect;
