const defineRuleOptionsSchema = {
  type: 'object', 
  id:   'defineRuleOptions',
  
  properties: {
    ruleName: {
      type: 'string',
    },
    check: {
      typeof: 'function',
    },
    defaultOptions: {
      type: 'object',
    },
    schema: {
      type: 'object',
    },
    isMetaRule: {
      type: 'boolean',
    },
    rules: {
      type: 'array', 
      
      items: {
        type: 'string',
      },
    },
    
  },
  
};

module.exports = defineRuleOptionsSchema;
