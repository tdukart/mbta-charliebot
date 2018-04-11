const CharlieBot = require('./App');
const pushToSlack = require('./services/slack/pusher');

const SlackConnection = require('./classes/SlackConnection');

const { slackClientId, slackClientSecret } = require('../config');

const Datastore = require('nedb');

const connectionDb = new Datastore({
  filename: 'data/connections.db',
  autoload: true,
});

const charlieBot = new CharlieBot();

const activeConnections = [];

const silverLineRoutes = [
  '741', // SL1
  '742', // SL2
  '743', // SL3
  '751', // SL4
  '749', // SL5
];

silverLineRoutes.forEach((route) => {
  charlieBot
    .fetch(route)
    .then(alerts => alerts.map(alert => pushToSlack({ channel: 'silver-line-test', ...alert })));
});

const express = require('express');
const slack = require('slack');

const app = express();
const PORT = 8080;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send(`Hello world! ${req.url}`);
});

app.get('/oauth', (req, res) => {
  // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that
  // code is not there, we respond with an error message
  if (!req.query.code) {
    res.status(500);
    res.send({ Error: "Looks like we're not getting code." });
    // eslint-disable-next-line no-console
    console.log("Looks like we're not getting code.");
  } else {
    // If it's there...

    slack.oauth.access({
      code: req.query.code,
      client_id: slackClientId,
      client_secret: slackClientSecret,
    }).then((body) => {
      connectionDb.insert(body);
      res.json('All set! Return to Slack.');
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500);
      res.send({ Error: 'OAuth error' });
    });
  }
});

connectionDb.find({}, (err, connectionList) => {
  connectionList.forEach((connectionData) => {
    activeConnections.push(new SlackConnection(connectionData));
  });
});

process.on('beforeExit', () => {
  activeConnections.forEach(connection => connection.close());
});
