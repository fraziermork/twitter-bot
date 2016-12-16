const configureTwitterBotOptionsSchema = {
  type: 'object', 
  id:   'configureTwitterBotOptions',
  
  properties: {
    Twit: {
      typeof: 'function',
    },
  },
  
};

module.exports = configureTwitterBotOptionsSchema;
