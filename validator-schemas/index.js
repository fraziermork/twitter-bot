/**
 * All the schemas for the validate module to use
 * @see {@link validate}
 * @module schemas 
 */ 

const schemas = {
  configureTwitterBotOptions: require('./configure-twitter-bot-options-schema'), 
  ruleProviderOptions:        require('./rule-provider-options-schema'),
  defineRuleOptions:          require('./define-rule-options-schema'),
  twitterBotOptions:          require('./twitter-bot-options-schema'),
  factoryOptions:             require('./factory-options-schema'),
  searchTerm:                 require('./search-term-schema'),
  apiKeys:                    require('./api-keys-schema'),
};

module.exports = schemas;
