const ruleProviderOptionsSchema = {
  type: 'object',
  id:   'ruleProviderOptions',
  
  properties: {
    v5: {
      type:    'boolean',
      default: true,
    },
  },
};
module.exports = ruleProviderOptionsSchema;
