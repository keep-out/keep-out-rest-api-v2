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



function findHandles(truckId){
	db.one('SELECT * FROM trucks WHERE truck_id=$1', truckId)
	.then(function (data) {
    if(data.name !== undefined || data.name !== null){
  		console.log(data.name);
      //console.log(data.twitter_handle);
      findHandle(data.name);
    } else {
      console.log('fail: omitted');
    }
	})
	.catch(function (err) {
		console.log(err);
	});
}

// Run function
/*
for (var i = 0, i < 1200; i++) {
  findHandles(i);
}
*/
//addTwitterHandle(null, 'Off The Grid');
//findHandle('Churro Boss');

// Find the Twitter Handle using Restaurant Name
function findHandle(restaurantName) {
 var params = {
   q: restaurantName,
   count: 5,
   include_entities: false
 }

 client.get("users/search", params, function(error, userInfo, response) {
   if (!error) {
     if (userInfo[0] !== undefined) {
        console.log('Twitter ID: ' + userInfo[0].id);
        console.log('Twitter Handle: ' + userInfo[0].screen_name);

        //console.log(userInfo[0]);


       //Add Handle to the Database
       addTwitterHandle(userInfo[0].screen_name, restaurantName);
       //End Add Handle
     } else {
       console.log('fail: no match');
     }

   }
     else {
       console.error('An error in GetName occurred!'); //error handling
   }
 });
}

// Add Twitter Handle to Database using Restaurant Name
function addTwitterHandle(twitter_handle, restaurantName) {
  db.any('UPDATE trucks SET twitter_handle=$1 WHERE name=$2', [twitter_handle, restaurantName])
  .then(function(data) {
    console.log('success');
  })
  .catch(function(err) {
    console.log(err);
  })
}


// Get Twitter Timeline: 4 Most Recent Tweets
function getTimeline(twitter_handle) {
  var params = {
    screen_name: twitter_handle,
    count: 4,
    exclude_replies: true,
    include_rts: false
  };
  client.get("statuses/user_timeline", params, function(error, tweets, response) {
    if (!error) {
      for (var index = 0; index < tweets.length; index++) {
          console.log(' ');

          var tweet = tweets[index].text;
          console.log('Tweet #' + index + ': ' + tweet);

          }


    } else {
      console.error('An error occurred!'); //error handling
    }

  });
}



/**  OLD TWITTER PARSER **/
/*
function getTruckInfo() {
  var params = {
    screen_name: "BookThatTruck",
    count: 5,
    exclude_replies: true,
    include_rts: false
  };

  client.get("statuses/user_timeline", params, function(error, tweets, response) {
    if (!error) {
      for (var index = 0; index < tweets.length; index++) {
          console.log(' ');

          //FULL LENGTH TWEET
          //console.log('Tweet #' + index + ': ' + tweets[index].text);

          var tweet = tweets[index].text;
          console.log('Tweet #' + index + ': ' + tweet);

          var restaurantHandle = null;
          var restaurantHashtag = null;

          if(  tweets[index].text.includes('MON')||tweets[index].text.includes('TUES') ||
               tweets[index].text.includes('WED')||tweets[index].text.includes('THURS') ||
               tweets[index].text.includes('FRI')||tweets[index].text.includes('SAT') ||
               tweets[index].text.includes('SUN')){

              //Restaurant Twitter Handle or Hashtag Mention
              if((tweets[index].entities.hasOwnProperty('user_mentions') && tweets[index].entities.hasOwnProperty('hashtags')) &&
                tweets[index].text.includes('@') && (tweets[index].text.indexOf('@') < tweets[index].text.indexOf('#'))){
                  restaurantHandle = tweets[index].entities.user_mentions[0].screen_name;
                  //console.log('Restaurant Handle: ' + restaurantHandle);
                  getName(restaurantHandle);

              } /*else if (tweets[index].entities.hasOwnProperty('user_mentions') && tweets[index].text.includes('@')) {
                  restaurantHandle = tweets[index].entities.user_mentions[0].screen_name;
                  console.log('Restaurant Handle: ' + restaurantHandle);
              }  else if (tweets[index].entities.hasOwnProperty('hashtags') && tweets[index].text.includes('#')) {
                  restaurantHashtag = tweets[index].entities.hashtags[0].text;
                  console.log('Restaurant Hashtag Mention: ' + restaurantHashtag);
              }

              //var loc_time = getLoc_Time(tweet);
              //console.log ('Location & Time below: ');
              //console.log (loc_time);

              if(tweets[index].entities.hasOwnProperty('media')) {
                var restaurantPic = tweets[index].entities.media[0].media_url_https;

                console.log('Picture File: ' + restaurantPic);
                if (restaurantHandle != null) {
                  addPicture(restaurantHandle, restaurantPic);
                } else if (restaurantHashtag != null) {

                }
              }
          }

          //Base 64 Feature
          if(tweets[index].entities.media != null) {
            base64Img.requestBase64(tweets[index].entities.media[0].media_url_https, function(err,res,body) {
              if(!error) {
                //console.log(res);

                //Base64 Image
                //console.log(body);
              } else {
                console.error('An error occurred!'); //error handling
              }
            });
            //Restaurant & Tweet Attached Food Picture [.jpg URL] (Populate Media)

          }

          //Text of All Tweets

          //console.log(tweets[index].text);

    } else {
      console.error('An error occurred!'); //error handling
    }

  });


function getName(twitterHandle) {
  var params = {
    screen_name: twitterHandle,
    include_entities: false
  };

  var realName;


  client.get("users/lookup", params, function(error, userInfo, response) {
    if (!error) {
      if(userInfo[0].hasOwnProperty('name')){

        //Search for Twitter Handle, then add to restaurant name
        realName = userInfo[0].name;

        //Create Truck
        console.log('Restaurant Handle: ' + twitterHandle);
        console.log('Restaurant Name: ' + realName);

        addTruck(twitterHandle, realName);

        getYelpData(realName);
      } else {
        //return twitterHandle;
      }
    }
      else {
        console.error('An error in GetName occurred!'); //error handling
    }
  });
  //return realName;

}




/** START OLD PARSER **/
/*
function getYelpData(restaurantName) {
  yelp_client.search({
    term: restaurantName,
    location: 'los angeles, ca'
    }).then(response => {

      var rating = response.jsonBody.businesses[0].rating;
      var phone = response.jsonBody.businesses[0].phone;

      console.log('Restaurant Name: ' + restaurantName);
      console.log('Rating: ' + rating);
      console.log('Phone Number: ' + phone);

      //addDetails(restaurantName, rating, phone);

      if (response.jsonBody.hasOwnProperty('businesses'))
      {
        var lat = response.jsonBody.businesses[0].coordinates.latitude;
        var long = response.jsonBody.businesses[0].coordinates.longitude;

        console.log('Location Latitude: ' + lat);
        console.log('Location Longitude: ' + long);

        //addCoords(restaurantName, lat, long);
      }
    }).catch(e => {
      console.log(e)
    });
}

function addTruck(restaurantHandle, restaurantName) {
  var broadcasting = false;
  db.one('INSERT INTO trucks(twitter_handle, name, broadcasting)' +
         'VALUES ($1, $2, $3) RETURNING truck_id',
         [restaurantHandle, restaurantName, broadcasting])
  .then(function(data) {
    console.log('Added truck with id: ' + data.truck_id);
  })
  .catch(function (err) {
    console.log(err);
  });
}

function addDetails(restaurantName, rating, phone) {
  db.one('UPDATE trucks' +
         'SET rating = ${rating}, phone = ${phone}' +
         'WHERE restaurantName = ${restaurantName} RETURNING truck_id')
  .then(function(data) {
    console.log('Added details to truck: ' + data.truck_id);
  })
  .catch(function(err) {
    console.log(err);
  });
}

function addCoords(truck_id, lat, long) {
  db.one('INSERT INTO coordinates(truck_id, latitude, longitude)' +
         'VALUES ($1, $2, $3) RETURNING truck_id',
         [truck_id, lat, long])
  .then(function(data) {
    console.log('Added coordinates to truck: ' + data.truck_id);
  })
  .catch(function (err) {
    console.log(err);
  });
}

function addPicture(restaurantHandle, url) {
  db.one('UPDATE trucks ' +
         'SET url=$1' +
         'WHERE twitter_handle=$2 RETURNING truck_id',
         [url, restaurantHandle])
  .then(function(data) {
    console.log('Added picture to truck: ' + data.truck_id);
  })
  .catch(function (err) {
    console.log(err);
  });
}
*/
/** END OLD PARSER **/





// findHandle()


/*
function getLoc_Time(tweet) {
  var reg = new RegExp(/^\s*(\w*)[\s,\.]+((?:[\s,\.]*[^\s\n]*)*?)[\s,\.]*?((?:[A-Za-z_\.]+?[\s,\.]*?)*)\s+?(\w+?\/\w+|\d+(?:[\s,\.]*?[A-Za-z\.][a-z\.]*?)*)(?:[\s,\.]+[#@A-Za-z]*)*(?:(\d{5})?)[\s,\.]*((?:[\s,\.]*?[A-Za-z]+)*).*?OPEN[\s,\.]*?([0-9]{1,2}):?([0-9:]{2})-([0-9]{1,2}):?([0-9]{2}).*?\s*$/i);
  var matches = tweet.match(reg);
  if (matches == null)
  {
    return null;
  }
  var startinfo = {hour: matches[7],minute: matches[8]};
  var endinfo = {hour: matches[9], minute: matches[10]};
  var stamp = resolveDate(matches[1],startinfo,endinfo);
  if (stamp == null)
  {
    return null;
  }
  var outData = {
    "address": matches[4],
    "zip": matches[5],
    //"addressnotes": matches[3],
    //"tags": matches[2],
    "notes": matches[6], //additional notes about truck location (eg: "behind building")
    //times
    // "open": stamp[0].toString(),
    // "close": stamp[1].toString()
    "open": stamp[0].getTime(),
    "close": stamp[1].getTime()
  };
  return outData;
}

function resolveDate (day,start,end) {
  if ((start.hour == "") || (start.minute == "") || (end.hour == "") || (end.minute == ""))
	{
		return null;
	}

	var startHour = parseInt(start.hour);
	var endHour = parseInt(end.hour);
	//probably fine for now, determines true time
	if (endHour > startHour) //if both same 'AM/PM'
	{
		if (startHour < 6)
		{
			startHour += 12;
			endHour += 12;
		}
	}
	else
	{
		endHour += 12;
	}

	var dayLookup = {"SUN":0,"MON":1,"TUES":2,"WED":3,"THURS":4,"FRI":5,"SAT":6};
	var today = new Date(Date.now());
	var startStamp = new Date();
	var endStamp = new Date();

	//ONLY need to worry about timezones when deciding if truck is open/closed based on its location
	//opening hours are truck-specific so they follow the truck to whatever timezone it's in,
	// but they don't need to be corrected for

	day = day.toUpperCase();
	if (!(day in dayLookup))
	{
		return null;
	}

	today.setHours(6,0); //6am
	startStamp.setHours(startHour,parseInt(start.minute),0,0);
	endStamp.setHours(endHour,parseInt(end.minute),0,0);
	//check from yesterday to avoid time inconsistency worries
	var dayNum = (today.getDay()+6)%7;
	var date = today.getDate()+(dayLookup[day]-today.getDay());
	if (dayLookup[day] < (dayNum))
	{
		date += 7;
	}
	startStamp.setDate(date);
	endStamp.setDate(date);
	return [startStamp, endStamp];
}
*/
/** END TRASH CODE **/
