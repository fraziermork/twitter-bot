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
    
    _isRoot: {
      type: 'boolean',
    }, 
    
    content: {
      typeof: 'function',
    },
    
  },
};

module.exports = twitterBotOptions;
