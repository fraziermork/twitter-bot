'use strict';
//chai test stuff
let chai        = require('chai');
let expect      = chai.expect;

//rewire
let rewire = require('rewire');
let Twit        = require('twit');
let testKeys    = require(__dirname + '/../config/test-config1.js');
let TimerBot  = require(__dirname + '/../../lib/defineTimerBot.js');
let twit        = new Twit(testKeys);
// _TimerBot.__proto__('twit', twit);
let timerBot;
// timerBot.twit = twit;
// let timerBot;


//testing the promise API
describe('define TimerBot', function(){
  timerBot = null;
  before(function (done){
    timerBot = new TimerBot();
  });
});

describe('constructor', function(){
  it('should let you build a new instance',function(done){
    console.log('in constructor');
    timerBot = new _TimerBot();
    expect(timerBot.twit).to.be.instanceof(Twit);
    timerBot.twit = twit;
    expect(timerBot.dontStopOnError).to.eql(false);
    console.log(timerBot);
    expect(timerBot._running).to.eql(false);
    expect(timerBot.interval).to.eql(3600000);
    done();

  });




});
  // it('GET account/verify_credentials from ', function(done){
  //   twit.get('account/verify_credentials',)
  // });
  describe('initialize TimerBot function', function(){
    it('should check to see if the user id exists', function(done){
      timerBot.initialize(function(data, response) {
        expect(this._running).to.equal(true);
        expect(this.dontStopOnError).to.equal(true);
        console.log('Data from initialize: ');
        console.log(data);
        done();
      });

    });

  });

//   describe('intialize method', () => {
//
//   });
// });
