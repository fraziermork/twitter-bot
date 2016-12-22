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
    // options: {
    //   type:    'object',
    //   default: {},
    // },
    defaultOptions: {
      type:       'object',
      default:    {},
      properties: {
        expect: {
          type:    'boolean',
          default: true,
        },
      },
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
