var express = require('express');
var router = express.Router();

var vt = require('../auth/verifyToken');
var db = require('../queries');
var twitter = require('../twitter/twitterAPI');
var yelp = require('../twitter/yelpAPI');

<<<<<<< HEAD
=======
// TODO: remove test call
// twitter.getTruckInfo();
>>>>>>> 1cd7953c60c41c632fec911b6e1d1e30f8a08753

// Auth endpoints
router.post('/api/v1/auth/authenticate', db.authenticate);
router.post('/api/v1/auth/register', db.register);

// Bookmark endpoints
router.post('/api/v1/bookmarks', vt.verifyToken, db.addBookmark);
router.delete('/api/v1/bookmarks', vt.verifyToken, db.deleteBookmark);
router.get('/api/v1/bookmarks/:id', vt.verifyToken, db.getAllBookmarks);

// Truck endpoints
router.post('/api/v1/trucks/local', vt.verifyToken, db.getLocalTrucks);
router.get('/api/v1/trucks/main', vt.verifyToken, db.getTruckMainInfo);
router.get('/api/v1/trucks', vt.verifyToken, db.getAllTrucks);
router.get('/api/v1/trucks/:id', vt.verifyToken, db.getTruck);
router.post('/api/v1/trucks', vt.verifyToken, db.createTruck);
router.put('/api/v1/trucks/:id', vt.verifyToken, db.updateTruck);
router.delete('/api/v1/trucks/:id', vt.verifyToken, db.deleteTruck);

// User endpoints
router.get('/api/v1/users/', vt.verifyToken, db.getAllUsers);
router.get('/api/v1/users/:id', vt.verifyToken, db.getUser);
router.post('/api/v1/users', vt.verifyToken, db.createUser);
router.put('/api/v1/users/:id', vt.verifyToken, db.updateUser);
router.delete('/api/v1/users/:id', vt.verifyToken, db.deleteUser);

// S3 endpoints
router.get('/api/v1/s3/trucks/photo/:id', vt.verifyToken, db.getTruckPhoto);
router.post('/api/v1/s3/trucks/photo/:id', vt.verifyToken, db.uploadTruckPhoto);
router.put('/api/v1/s3/trucks/photo/:id', vt.verifyToken, db.uploadTruckPhoto);
router.get('/api/v1/s3/trucks/schedule/:id', vt.verifyToken,
  db.getTruckSchedule);
router.post('/api/v1/s3/trucks/schedule/:id', vt.verifyToken,
  db.uploadTruckSchedule);
router.put('/api/v1/s3/trucks/schedule/:id', vt.verifyToken,
  db.uploadTruckSchedule);
router.get('/api/v1/s3/users/photo/:id', vt.verifyToken, db.getUserPhoto);
router.post('/api/v1/s3/users/photo/:id', vt.verifyToken, db.uploadUserPhoto);
router.put('/api/v1/s3/users/photo/:id', vt.verifyToken, db.uploadUserPhoto);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Munch Bunch REST API' });
});

module.exports = router;
