const apiKeysSchema = {
  type: 'object', 
  
  properties: {
    consumer_key: {
      type: 'string',
    },
    consumer_secret: {
      type: 'string',
    },
    access_token: {
      type: 'string',
    },
    access_token_secret: {
      type: 'string',
    },
    
    required: [
      'consumer_key', 
      'consumer_secret',
      'access_token',
      'access_token_secret',
    ],
  },
  
  
};
module.exports = apiKeysSchema;
