#initialize

###TwitterBot.prototype.initialize = function initialize(callback)

This initializes the bot buy using the Twitter endpoint 'account/verify_credentials' to GET the account information and check if it exists before running any functions on.

**example**  

````  
//initializes and get callback to run functions on//

TwitterBot.prototype.initialize = function initialize(callback){
	Twitter.get('/account/verify_credentials', (err, data, response){
	//returns data and response to run a .then method on to respond with the user name and id//
	});
};


````
