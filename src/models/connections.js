const Datastore = require('nedb');

const connectionDb = new Datastore({
  filename: 'data/connections.db',
  autoload: true,
});

module.exports = { db: connectionDb };
