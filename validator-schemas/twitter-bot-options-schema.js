const twitterBotOptions = {
  type: 'object', 
  id:   'TwitterBotOptions',
  
  properties: {
    rules: {
      type: 'array', 
      
      items: {
        anyOf: [
          {
            // TODO: write custom validator to check and see if the schema/rule exists? 
            type: 'string',
          }, 
          // TODO: write meta schema for rule definition objects like this 
          {
            type:     'object',
            required: [
              'check',
            ],
            properties: {
              name: {
                type: 'string',
              }, 
              check: {
                typeof: 'function',
              },
              expected: {
                type: 'boolean',
              },
            },
          }, 
        ], 
      },
      
    }, 
    
    content: {
      typeof: 'function',
    },
    
    streaming: {
      type:    'boolean',
      default: true,
    },
    
    _isRoot: {
      type: 'boolean',
    }, 
    
  },
};

module.exports = twitterBotOptions;
