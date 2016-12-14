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
