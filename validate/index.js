const constructValidate = require('./validator');

// schemas 
const schemas = {
  configureTwitterBotOptions: require('./schemas/configure-twitter-bot-options-schema'), 
  twitterBotOptions:          require('./schemas/twitter-bot-options-schema'),
};

module.exports = constructValidate(schemas);
