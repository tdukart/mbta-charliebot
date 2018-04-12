const SlackConnection = require('./classes/SlackConnection');

const { slackClientId, slackClientSecret } = require('../config');

const { db: connectionDb } = require('./models/connections');
const sendAlertsForRoute = require('./services/sendAlertsForRoute');

const activeConnections = [];

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
      activeConnections.push(new SlackConnection(body));
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500);
      res.send({ Error: 'OAuth error' });
    });
  }
});

app.get('/refresh', (req, res) => {
  sendAlertsForRoute('Red');
  res.send('Refreshing Red Line alerts...');
});

connectionDb.find({}, (err, connectionList) => {
  connectionList.forEach((connectionData) => {
    activeConnections.push(new SlackConnection(connectionData));
  });
});

process.on('beforeExit', () => {
  activeConnections.forEach(connection => connection.close());
});
