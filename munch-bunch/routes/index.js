var express = require('express');
var router = express.Router();

var db = require('../queries');

// Truck endpoints
router.get('/api/v1/trucks', db.getAllTrucks);
// router.get('/api/v1/trucks/:id', db.getTruck);
// router.post('/api/v1/trucks', db.createTruck);
// router.put('/api/v1/trucks/:id', db.updateTruck);
// router.delete('/api/v1/trucks/:id', db.deleteTruck);

// // User endpoints
// router.get('/api/v1/users/:id', db.getUser);
// router.post('/api/v1/users', db.createUser);
// router.put('/api/v1/users/:id', db.updateUser);
// router.delete('/api/v1/users/:id', db.deleteUser);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
