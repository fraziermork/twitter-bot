const metaRules = [
  {
    ruleName:       'search', 
    defaultOptions: { expect: true }, 
    isMetaRule:     true,
    
    rules: [
      { 
        ruleName:       'textMatch', 
        defaultOptions: { },
      }, 
      {
        ruleName:       'isRetweet', 
        defaultOptions: { expect: false },
      },
    ],
  }, 
  
  
];
module.exports = metaRules;
