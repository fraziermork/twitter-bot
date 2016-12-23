const _ = require('lodash');

const mockApiResponses = {
  
  /**  
   * verifyCredentials - A mock response from GET account/verify_credentials @see {@link https://dev.twitter.com/rest/reference/get/account/verify_credentials}
   *    
   * @return {object}  - Mock response object   
   */   
  verifyCredentials() {
    const dummyId = Date.now();
    return _.defaultsDeep({}, {
      contributors_enabled:  false, 
      created_at:            (new Date()).toUTCString(), 
      default_profile:       false, 
      default_profile_image: false, 
      description:           'I am a dummy test account of an authenticated user',
      favourites_count:      0, 
      follow_requests_sent:  0, 
      followers_count:       0, 
      following:             null, 
      friends_count:         0, 
      geo_enabled:           false, 
      id:                    dummyId, 
      id_str:                dummyId.toString(), 
      is_translator:         false, 
      lang:                  'en', 
      listed_count:          0, 
      location:              'earth', 
      name:                  'Foo Bar', 
      notifications:         null, 
      screen_name:           'fooBar', 
      statuses_count:        0, 
      url:                   null, 
      
      // ignoring properties: 
      // 
      // profile_* 
      // status 
      // time_zone 
      // utc_offset 
      // verified 
    });
  },
};
module.exports = mockApiResponses;
