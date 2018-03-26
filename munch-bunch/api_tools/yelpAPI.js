var express = require('express');
var base64Img = require('base64-img');
var routes = require('../routes/index');
var queries = require('../queries');
//var tweet_parser = require('../node_modules/tweet-parser/index')


/**
**
  SET UP CREDENTIALS
**
**/
var apiKey = 'x_AaSV1-FeQljvaPuY1XlbHtLJ1-ccMzMF2f4oSLp2BwVDsCIxYTowJsRFfqVip14lbanWOmfLp2v5fgGD5Wfm4oV9ax2MW2MOB7WxIktejdBAiyGnWn9hzZ-fG1WnYx';

const yelp = require('../node_modules/yelp-fusion');
const yelp_client = yelp.client(apiKey);


var db = queries.getDB();


function searchLATrucks() {
  yelp_client.search({
    term: 'food truck',
    catetories: 'foodtrucks',
    location: 'houston, tx',
    radius: 40000,
    limit: 50
  }).then(response => {

    for (var i = 0; i < 50; i++) {
      var name = response.jsonBody.businesses[i].name;
      var genre = response.jsonBody.businesses[i].categories[0].title;
      var rating = response.jsonBody.businesses[i].rating;
      var phone = response.jsonBody.businesses[i].phone;
      var image = response.jsonBody.businesses[i].image_url;


      console.log('Restaurant Name: ' + name);
      console.log('Rating: ' + rating);
      console.log('Phone Number: ' + phone);
      console.log('Genre: ' + genre);
      console.log('Image URL: ' + image);


      if (response.jsonBody.hasOwnProperty('businesses'))
      {
        var lat = response.jsonBody.businesses[i].coordinates.latitude;
        var long = response.jsonBody.businesses[i].coordinates.longitude;

        console.log('Location Latitude: ' + lat);
        console.log('Location Longitude: ' + long);

      }

      addTruck(name, rating, phone, genre, image, lat, long);
    }
  }).catch(e => {
    console.log(e)
  });
}

function searchSFTrucks() {
  yelp_client.search({
    term: 'food truck',
    catetories: 'foodtrucks',
    location: 'san francisco, ca',
    radius: 40000,
    limit: 2
  }).then(response => {
    /*
    *
    *
    *
    INSERT phone_number WHERE restaurant name = restaurantName
    *
    *
    *
    */
    console.log(response);

    for (var i = 0; i < 2; i++) {
      var name = response.jsonBody.businesses[i].name;
      var genre = response.jsonBody.businesses[i].categories[0].title;
      var rating = response.jsonBody.businesses[i].rating;
      var phone = response.jsonBody.businesses[i].phone;
      var image = response.jsonBody.businesses[i].image_url;


      console.log('Restaurant Name: ' + name);
      console.log('Rating: ' + rating);
      console.log('Phone Number: ' + phone);
      console.log('Genre: ' + genre);
      console.log('Image URL: ' + image);

      //addTruck(restaurantName, rating, phone);

      if (response.jsonBody.hasOwnProperty('businesses'))
      {
        var lat = response.jsonBody.businesses[i].coordinates.latitude;
        var long = response.jsonBody.businesses[i].coordinates.longitude;

        console.log('Location Latitude: ' + lat);
        console.log('Location Longitude: ' + long);

        //addCoords(restaurantName, lat, long);
      }
    }
    addTruck(name, rating, phone, genre, image, lat, long);

  }).catch(e => {
    console.log(e)
  });
}

function searchDenverTrucks() {
  yelp_client.search({
    term: 'food truck',
    catetories: 'foodtrucks',
    location: 'san francisco, ca',
    radius: 40000,
    limit: 2
  }).then(response => {
    /*
    *
    *
    *
    INSERT phone_number WHERE restaurant name = restaurantName
    *
    *
    *
    */
    //console.log(response);

    for (var i = 0; i < 2; i++) {
      var name = response.jsonBody.businesses[i].name;
      var genre = response.jsonBody.businesses[i].categories[0].title;
      var rating = response.jsonBody.businesses[i].rating;
      var phone = response.jsonBody.businesses[i].phone;
      var image = response.jsonBody.businesses[i].image_url;


      console.log('Restaurant Name: ' + name);
      console.log('Rating: ' + rating);
      console.log('Phone Number: ' + phone);
      console.log('Genre: ' + genre);
      console.log('Image URL: ' + image);

      //addDetails(restaurantName, rating, phone);

      if (response.jsonBody.hasOwnProperty('businesses'))
      {
        /*
        **
          Add into Coords
        **
        */
        var lat = response.jsonBody.businesses[i].coordinates.latitude;
        var long = response.jsonBody.businesses[i].coordinates.longitude;

        console.log('Location Latitude: ' + lat);
        console.log('Location Longitude: ' + long);

        //addCoords(restaurantName, lat, long);
      }
      addTruck(name, rating, phone, genre, image, lat, long);
    }
  }).catch(e => {
    console.log(e)
  });
}

function addTruck(name, rating, phone, genre, url, latitude, longitude) {
  var broadcasting = false;
  db.one('INSERT INTO trucks(name, rating, phone, genre, url) VALUES ($1, $2, $3, $4, $5) RETURNING truck_id',
         [name, rating, phone, genre, url])
  .then(function(data) {
    /* Insert Truck Events: Coordinates and Broadcasting */
    db.none('INSERT INTO truckevents(truck_id, latitude, longitude, broadcasting) VALUES ($1, $2, $3, $4)',
      [data.truck_id, latitude, longitude, broadcasting])
    .then(function(data){
      console.log('success');
    }).catch(function(err){
      console.log(err);
    })

    console.log('Added truck with id: ' + data.truck_id);
  })
  .catch(function (err) {
    console.log(err);
  });
}

// searchLATrucks();
