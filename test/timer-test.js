'use strict';
let Twit      = require('twit');
// let rewire    = require('rewire');
// let TimerBot  = require(__dirname + '/../lib/defineTimerBot.js');
let chai      = require('chai');
let expect    = chai.expect;
let keys      = require(__dirname + '/../config/test-config1.js');
let t         = new Twit(keys);
describe('defineTimerBot.js', function(){
  describe('it should post statuses', function(){
    before('setting up the status', (done) => {
      // timerBot = new TimerBot();
      setTimeout(done, 1200);
      // done();

    });
    it('should let you get statuses to post', function(done) {
      let today     = new Date();
      t.get('statuses/user_timeline', {status: today.toISOString(), screen_name: 'backwards_bot'}, function(err, data, response){
        // console.log('made request to get statuses');
        expect(err).to.eql(undefined);
        expect(response.statusCode).to.eql(200);
        expect(data).to.be.instanceof(Array);
        expect(data[0].user.name).to.eql('Reizarf Krom');
        expect(data[0].user.id_str).to.eql('714197490480754688');
        done();
      });
    });
    it('should post the timestamp to the time',function(done){
      let today     = new Date();
      t.post('statuses/update', {status: today.toISOString()}, function(err, data, response){
        // console.log('POST DATA______________ ', data);
        // console.log('POST res______________ ', response[0]);
        // console.log('made request to post status');
        expect(err).to.eql(undefined);
        expect(response.statusCode).to.eql(200);
        expect(data.text).to.not.eql(null);
        expect(data.user.name).to.eql('Reizarf Krom');
        done();
      });
    });
  });
});
