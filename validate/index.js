const constructValidate = require('./validator');

// schemas 
const schemas = {
  configureOptions:  require('./schemas/configure-options-schema'), 
  twitterBotOptions: require('./schemas/twitter-bot-options-schema'),
};

module.exports = constructValidate(schemas);
