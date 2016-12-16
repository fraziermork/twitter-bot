/**
 * All the schemas for the validate module to use
 * @see {@link validate}
 * @module schemas 
 */ 

const schemas = {
  configureTwitterBotOptions: require('./configure-twitter-bot-options-schema'), 
  twitterBotOptions:          require('./twitter-bot-options-schema'),
  factoryOptions:             require('./factory-options-schema'),
  apiKeys:                    require('./api-keys-schema'),
};

module.exports = schemas;
