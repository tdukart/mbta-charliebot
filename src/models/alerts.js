const Datastore = require('nedb');

const alertsDb = new Datastore({
  filename: 'data/alerts.db',
  autoload: true,
});

module.exports = { db: alertsDb };
