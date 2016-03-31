'use strict';
// //chai test stuff
// let chai        = require('chai');
// let expect      = chai.expect;
//
// //rewire
// let rewire = require('rewire');
// let Twit        = require('twit');
// let testKeys    = require(__dirname + '/../config/test-config1.js');
// let TimerBot  = require(__dirname + '/../../lib/defineTimerBot.js');
// let twit        = new Twit(testKeys);
// // _TimerBot.__proto__('twit', twit);
// let timerBot;
// // timerBot.twit = twit;
// // let timerBot;
//
//
// //testing the promise API
// describe('define TimerBot', function(){
//   timerBot = null;
//   before(function (done){
//     timerBot = new TimerBot();
//   });
// });
//
// describe('constructor', function(){
//   it('should let you build a new instance',function(done){
//     console.log('in constructor');
//     timerBot = new _TimerBot();
//     expect(timerBot.twit).to.be.instanceof(Twit);
//     timerBot.twit = twit;
//     expect(timerBot.dontStopOnError).to.eql(false);
//     console.log(timerBot);
//     expect(timerBot._running).to.eql(false);
//     expect(timerBot.interval).to.eql(3600000);
//     done();
//
//   });
//
//
//
//
// });
//   // it('GET account/verify_credentials from ', function(done){
//   //   twit.get('account/verify_credentials',)
//   // });
//   describe('initialize TimerBot function', function(){
//     it('should check to see if the user id exists', function(done){
//       timerBot.initialize(function(data, response) {
//         expect(this._running).to.equal(true);
//         expect(this.dontStopOnError).to.equal(true);
//         console.log('Data from initialize: ');
//         console.log(data);
//         done();
//       });
//
//     });
//
//   });
//
// //   describe('intialize method', () => {
// //
// //   });
// // });

'use strict';
let Twit      = require('twit');
// let rewire    = require('rewire');
require(__dirname + '/examples/timer-bot-example.js');
let chai      = require('chai');
let expect    = chai.expect;
let keys      = require(__dirname + '/../config/test-config1.js');
let t         = new Twit(keys);

// var server    = rewire(__dirname + '/../server.js');
// server.__set__('t', t);



describe('it should post statuses', function(){
  before('setting up the status', (done) => {
    setTimeout(done, 120000);
    done();

  });
  it('should let you post statuses', (done) => {
    t.get('statuses/user_timeline', {screen_name: 'backwards_bot'}, function(err, data, response){
      console.log('made request to get statuses');
      expect(err).to.equal(undefined);
      console.log('DATA IS _____________________________', data);
      console.log('RESPONSE IS _____________________________', response);
      done();
    })
    t.post('statuses/update', {})

  });

});
