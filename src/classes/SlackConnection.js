const { RTMClient, WebClient } = require('@slack/client');

const { createSubscription, removeSubscription } = require('../models/subscriptions');
const fetchRoute = require('../services/mbta/fetchRoute');

class SlackConnection {
  constructor({ bot, _id: connectionId }) {
    this.init(bot);

    this.connectionId = connectionId;
    this.bot = bot;
  }

  init(bot) {
    this.rtmClient = new RTMClient(bot.bot_access_token);
    this.webClient = new WebClient(bot.bot_access_token);

    this.rtmClient.start();
    this.addListeners();
  }

  addListeners() {
    this.rtmClient.on('member_joined_channel', (event) => {
      const { user, channel } = event;

      if (user === this.rtmClient.activeUserId) {
        this.rtmClient.sendMessage(
          'Hi there! I\'m still in development, so please expect some weirdness. (As of this ' +
          'moment, I\'m not quite set up to send regular updates either.)',
          channel,
        );
      }
    });

    this.rtmClient.on('message', (message) => {
      const {
        subtype,
        user,
        channel,
        text,
      } = message;

      const sendMessage = messageToSend => this.rtmClient.sendMessage(messageToSend, channel);

      // Skip messages that are from a bot or my own user ID
      if ((subtype && subtype === 'bot_message') ||
        (!subtype && user === this.rtmClient.activeUserId)) {
        return;
      }

      let regexPrefix = '';
      if (channel.substr(0, 1) !== 'D') {
        regexPrefix = `<@${this.bot.bot_user_id}> `;
      }

      const subscribeMatch = new RegExp(`^${regexPrefix}subscribe (.*)$`).exec(text);
      if (subscribeMatch) {
        fetchRoute(subscribeMatch[1].trim())
          .then((route) => {
            const subscriptionData = {
              connectionId: this.connectionId,
              channel,
              route: route.routeId,
            };
            createSubscription(subscriptionData)
              .then(() => {
                sendMessage(`You have subscribed to ${route.routeName}.`);
              });
          })
          .catch(() => {
            sendMessage(`I couldn't find a route named ${subscribeMatch[1]}.`);
          });
        return;
      }

      const unsubscribeMatch = new RegExp(`^${regexPrefix}unsubscribe (.*)$`).exec(text);
      if (unsubscribeMatch) {
        fetchRoute(unsubscribeMatch[1].trim())
          .then((route) => {
            removeSubscription({ connectionId: this.connectionId, channel, route: route.id })
              .then(() => {
                sendMessage(`You have unsubscribed from ${route.routeName}`);
              })
              .catch(() => {
                sendMessage(`I could not unsubscribe you from ${route.routeName}`);
              });
          })
          .catch(() => {
            sendMessage(`I couldn't find a route named ${unsubscribeMatch[1]}.`);
          });
      }
    });
  }

  close() {
    this.rtmClient = null;
  }
}

module.exports = SlackConnection;
