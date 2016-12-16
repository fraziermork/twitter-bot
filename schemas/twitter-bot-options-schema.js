const twitterBotOptions = {
  type: 'object', 
  
  properties: {
    rules: {
      type: 'array', 
      
      items: {
        anyOf: [
          {
            type: 'string',
          }, 
          {
            type:     'object',
            required: ['name', 'check', 'expected'],
            
            properties: {
              name:  'string', 
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
