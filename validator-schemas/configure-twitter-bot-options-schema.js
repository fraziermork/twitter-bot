const configureTwitterBotOptionsSchema = {
  type: 'object', 
  id:   'configureTwitterBotOptions',
  
  properties: {
    Twit: {
      typeof: 'function',
    },
    // stuff: {
    //   type: 'boolean',
    // },
  },
  
  
};

module.exports = configureTwitterBotOptionsSchema;
