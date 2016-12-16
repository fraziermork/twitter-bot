/**
 * Rest and streaming endpoints organized in a way that makes more sense. 
 * @module endpoints 
 * @private 
 */ 

const endpoints = {
  post: {
    tweet:  'statuses/update',
    delete: 'statuses/destroy/:id',
  },
  get: {
    mentionsAndReplies: 'statuses/mentions_timeline',
    verifyCredentials:  'account/verify_credentials',
  }, 
  stream: {
    user: 'user',
  },
};
module.exports = endpoints;
