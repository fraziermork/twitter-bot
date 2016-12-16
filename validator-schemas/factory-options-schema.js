const factoryOptionsSchema = {
  type: 'object', 
  
  properties: {
    content: {
      typeof: 'function',
    },
    
    extendsSchema: {
      // TODO: write custom validator to check and see if the schema it extends exists? 
      type: 'string', 
    },
    
    rules: {
      type:  'array', 
      items: {
        anyOf: [
          {
            typeof: 'function',
          }, 
          // TODO: write meta schema for rule definition objects like this 
          {
            type:     'object', 
            required: ['check'],
            
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
          {
            // TODO: custom validator for extendsSchema could apply here too 
            type: 'string',
          },
        ],
      },
    },
  },
};

module.exports = factoryOptionsSchema;
