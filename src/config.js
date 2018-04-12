const snakeCase = require('snake-case');

const config = {};

const configVars = ['mbtaKey', 'slackClientId', 'slackClientSecret', 'mongodbUri'];

configVars.forEach((varName) => {
  const envVarName = `${snakeCase(varName).toUpperCase()}`;
  config[varName] = process.env[envVarName];
});

module.exports = config;
