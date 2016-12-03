// These are the API keys for the primary bot being tested 

const primaryConfig = {
  consumer_key:        process.env.PRIMARY_TEST_TWITTER_CONSUMER_KEY, 
  consumer_secret:     process.env.PRIMARY_TEST_TWITTER_CONSUMER_SECRET, 
  access_token:        process.env.PRIMARY_TEST_TWITTER_ACCESS_TOKEN, 
  access_token_secret: process.env.PRIMARY_TEST_TWITTER_ACCESS_TOKEN_SECRET,
};

module.exports = primaryConfig;
