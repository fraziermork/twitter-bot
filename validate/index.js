const constructValidate = require('./validator');

// schemas 
const schemas = {
  configureTwitterBotOptions: require('./schemas/configure-twitter-bot-options-schema'), 
  twitterBotOptions:          require('./schemas/twitter-bot-options-schema'),
  apiKeys:                    require('./schemas/api-keys-schema'),
};

module.exports = constructValidate(schemas);
