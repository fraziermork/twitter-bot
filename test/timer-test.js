


'use strict';
let Twit      = require('twit');
// let rewire    = require('rewire');
let TimerBot = require(__dirname + '/../lib/defineTimerBot.js');
let chai      = require('chai');
let expect    = chai.expect;
let keys      = require(__dirname + '/../config/test-config1-lw.js');
let t         = new Twit(keys);
let counter = 0;
let i =0;

let timerBot;
// var server    = rewire(__dirname + '/../server.js');
// server.__set__('t', t);

describe('defineTimerBot.js', function(){


describe('it should post statuses', function(){
  before('setting up the status', (done) => {
    // timerBot = new TimerBot();
    setTimeout(done, 1200);
    // done();

  });
  it('should let you get statuses to post', function(done) {
    t.get('statuses/user_timeline', {status: 'Hello', screen_name: 'backwards_bot'}, function(err, data, response){
      console.log('made request to get statuses');
      console.log('DATA: ' + data);
      expect(err).to.eql(undefined);
      console.log(err);
      // console.log(data.screen_name)
      // expect(data.screeen_name).to.eql('backwards_bot');
      // expect(TimberBot.dontStopOnError).to.eql(true);
      expect(data).to.be.instanceof(Array);
      // expect(this.interval).to.eql()
      console.log('SCREEN NAME: ' + response.screen_name);
      expect(response.statusCode).to.eql(200);
      // expect(response.method).to.eql('GET');

      // console.log(response);
      // console.log();
      // expect
      counter =+ 1;
      // expect(optionObj.botName).to.eql('timerBot' + counter);
      // console.log('DATA IS _____________________________', data);
      console.log('RESPONSE IS _____________________________', response.headers);
      done();
    });
    // t.post('statuses/update', {status: 'hey'}, function(err, data, response){
    //   console.log('POST DATA: ' + data);
    // });

  // textReply();

  });

});



});
