const fs = require('fs');
const path = require('path');

const { pick } = require('lodash');
const snakeCase = require('snake-case');

let config = {};

const configVars = ['mbtaKey', 'slackClientId', 'slackClientSecret', 'mongodbUri'];

const configFilePath = path.join(__dirname, '../config.json');

if (fs.existsSync(configFilePath)) {
  const configJson = fs.readFileSync(configFilePath);
  config = JSON.parse(configJson.toString());
  config = pick(config, configVars);
} else {
  configVars.forEach((varName) => {
    const envVarName = `CHARLIE_${snakeCase(varName).toUpperCase()}`;
    config[varName] = process.env[envVarName];
  });
}

module.exports = config;
