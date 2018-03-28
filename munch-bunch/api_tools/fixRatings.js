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


//1161 Total
function runThis(i) {
    setTimeout(() => {
      if (i < 223){
        for(var j = 0; j < 5; j++){
          fixRating((i * 5) + j);
        }
        runThis(++i);
      }
    }, 2000)
}

//runThis(0);


function fixRating(truckId){
	db.one('SELECT * FROM trucks WHERE truck_id=$1', truckId)
	.then(function (data) {
    if(data.name !== undefined || data.name !== null){
      console.log(data);
    	console.log(data.name);

      db.one('SELECT * FROM truckevents WHERE truck_id=$1', truckId)
      .then(function(data){
        var lat = data.latitude;
        var long = data.longitude;

        ratingsByName(data.name, lat, long, truckId);
      }).catch(function(err){
        console.log(err);
      })
    } else {
      console.log('fail: omitted');
    }
	})
	.catch(function (err) {
		console.log(err);
	});
}

function ratingsByName(restaurantName, lat, long, truckId) {
  yelp_client.search({
    term: restaurantName,
    categories: 'foodtrucks',
    latitude: lat,
    longitude: long
  }).then(response => {
    var total_count = response.jsonBody.businesses[0].review_count; // Number of Reviews: Denominator
    var rating = response.jsonBody.businesses[0].rating;


    var new_rating = rating/5; // Decimal Number for Percentage
    var total_score = total_count * new_rating; // Cumulative Score: Numerator

    console.log('New Rating: ' + new_rating);
    console.log('Total Score: ' + total_score);
    console.log('Total Count: ' + total_count);


    // New Rating: Percentage Decimal, Total Count: Cumulative Score, Truck Name
    updateRating(new_rating, total_score, total_count, truckId);
  }).catch(e => {
    console.log(e)
  });
}

// Update Rating: If someone thumbs up --> total_count++,
function updateRating(new_rating, total_score, total_count, truckId) {
  db.any('UPDATE trucks SET rating=$1, total_score=$2, total_count=$3 WHERE truck_id=$4',
            [new_rating, total_score, total_count, truckId])
  .then(function(data) {
    console.log('SUCCESS: Updated Database for: ' + truckId);
    console.log('New Rating: ' + new_rating);
    console.log('Total Score: ' + total_score);
    console.log('Total Count: ' + total_count);
  })
  .catch(function(err) {
    console.log(err);
  })
}

function thumbsUp() {
  // Add +1: total_score++ and total_count++
  // New Rating = total_score/total_count

  //Update new rating
}

function thumbsDown() {
  // Add +1: total_count++
  // New Rating = total_score/total_count

  //Update New Rating
}


// Grab Total Number of Reviews from Yelp based off of TruckId's Name

// Create a Total: (Rating Converted to Decimal, Decimal * # Reviews = Total)
