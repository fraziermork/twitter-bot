// These are the API keys for the secondary bot that will prompt the primary bot 

const secondaryConfig = {
  consumer_key:        process.env.SECONDARY_TEST_TWITTER_CONSUMER_KEY, 
  consumer_secret:     process.env.SECONDARY_TEST_TWITTER_CONSUMER_SECRET, 
  access_token:        process.env.SECONDARY_TEST_TWITTER_ACCESS_TOKEN, 
  access_token_secret: process.env.SECONDARY_TEST_TWITTER_ACCESS_TOKEN_SECRET,
};

module.exports = secondaryConfig;
