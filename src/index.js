const CharlieBot = require('./App');
const pushToSlack = require('./services/slack/pusher');

const charlieBot = new CharlieBot();

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
