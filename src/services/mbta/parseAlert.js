const parseAlert = (routeName, { serviceEffect, description, header, url, severity }) => {
  const parsed = {
    severity,
  };

  parsed.text = `*${header}*`;
  parsed.text += '\n';
  parsed.text += description;
  if (url) {
    parsed.text += '\n';
    parsed.text += url;
    parsed.title_link = url;
  }

  parsed.title = `${routeName} Alert`;
  if (serviceEffect) {
    parsed.title += `: ${serviceEffect}`;
  }
  console.log(parsed);
  return parsed;
};

module.exports = parseAlert;
