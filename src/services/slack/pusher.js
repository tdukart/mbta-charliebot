const SlackWebhook = require('slack-webhook');

const pushToSlack = (webhookUrl, { channel = '', title = '', text, severity = null }) => {
  const slackHook = new SlackWebhook(webhookUrl);

  const messageData = {};
  if (channel) {
    messageData.channel = channel;
  }

  if (severity !== null) {
    if (severity < 4) {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          text,
        },
      ]
    } else if (severity < 7) {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          color: 'warning',
          text,
        },
      ]
    } else {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          color: 'danger',
          text,
        },
      ]
    }
  } else {
    messageData.text = text;
  }

  return slackHook.send(messageData);
};

module.exports = pushToSlack;
