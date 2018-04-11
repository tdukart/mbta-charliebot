const CharlieBot = require('./App');
const pushToSlack = require('./services/slack/pusher');

const charlieBot = new CharlieBot();

const { webhookUrl } = require('../config');

const routes = [
  'Red',
  'Green-D',
  '741', //Silver Line SL1
  'CR-Greenbush',
  '225',
];

routes.forEach((route) => {
  charlieBot
    .fetch(route)
    .then((alerts) => {
      return alerts.map(alert => pushToSlack(webhookUrl, alert));
    });
});
