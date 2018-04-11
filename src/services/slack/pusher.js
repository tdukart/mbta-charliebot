const slack = require('slack');
const { slackBotToken } = require('../../../config');

const pushToSlack = ({
  channel = '',
  title = '',
  text,
  severity = null,
}) => {
  const messageData = {};
  if (channel) {
    messageData.channel = channel;
  }

  if (severity !== null) {
    messageData.text = '';
    if (severity < 4) {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          text,
        },
      ];
    } else if (severity < 7) {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          color: 'warning',
          text,
        },
      ];
    } else {
      messageData.attachments = [
        {
          pretext: title,
          fallback: text,
          color: 'danger',
          text,
        },
      ];
    }
  } else {
    messageData.text = text;
  }

  return slack.chat.postMessage({
    token: slackBotToken,
    ...messageData,
  });
};

module.exports = pushToSlack;
