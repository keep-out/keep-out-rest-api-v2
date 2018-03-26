var express = require('express');
var Twitter = require('twitter');
var base64Img = require('base64-img');
var routes = require('../routes/index');
var queries = require('../queries');


/** SET UP CREDENTIALS **/
var apiKey = '7xY6QFVhWVu06g0cCmjsGyh3pVd8DcIZBjVRZoJGlp6KQGTPbBBKe2tRQKUt9_fbj2kVyMT5-K-3exSVakqc5SdCJ_Uvjgw8lA4EIu6C3KKUkzERa4B5XkBB1S2fWnYx';

const yelp = require('../node_modules/yelp-fusion');
const yelp_client = yelp.client(apiKey);


var router = express.Router();
var client = new Twitter({
  consumer_key: 'B1vBU6xSkzSHdIXNSdmTykril',
  consumer_secret: 'oOTtJR1FFdbBExnIcW5T2Oy11jKhttd5qWcGLCcLNgNHqfGoD4',
  access_token_key: '942160242783092736-LiNNPfaKLlWKU7yNS39HtCt2RIEEqxT',
  access_token_secret: 'd6Hqv7OiPkFcH7ja3fyr6GQbFFgNmya74K8M2SvNMFBfK'
});

var db = queries.getDB();
/** END SET UP CREDENTIALS **/



for (var i = 0; i < 20; i++) {
  fixRating(i);
}

function fixRating(truckId){
	db.one('SELECT * FROM trucks WHERE truck_id=$1', truckId)
	.then(function (data) {
    if(data.name !== undefined || data.name !== null){

    	console.log(data.name);
  		console.log(data.rating);
      var newRatio = data.rating/5;
      console.log(newRating);
      //updateRating(newRating, truckId);
    } else {
      console.log('fail: omitted');
    }
	})
	.catch(function (err) {
		console.log(err);
	});
}

function updateRating(newRating, truckId) {
  db.any('UPDATE trucks SET rating=$1 WHERE truck_id=$2', [newRating, truckId])
  .then(function(data) {
    console.log('success');
  })
  .catch(function(err) {
    console.log(err);
  })
}


// Grab Total Number of Reviews from Yelp based off of TruckId's Name

// Create a Total: (Rating Converted to Decimal, Decimal * # Reviews = Total)
