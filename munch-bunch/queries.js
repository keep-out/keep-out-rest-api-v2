var promise = require('bluebird');

var options = {
	// Initialization options
	promiseLib: promise
};

var pgp = require('pg-promise')(options);
const cn = {
	host: 'munchbunch-db-dev.cguknh9wbkgb.us-west-1.rds.amazonaws.com',
	port: 5432,
	database: 'munchbunch_db_dev',
	user: 'munchbunch',
	password: 'munchbunch'
};
const db = pgp(cn);
console.log('connected to database');

// Get all trucks from database
function getAllTrucks(req, res, next) {
	db.any('SELECT * FROM trucks').then(function (data) {
		res.status(200).json({
			status: 'success',
			data: data,
			message: 'Retrieved ALL trucks'
		});
	}).catch(function (err) {
		return next(err);
	});
}

// add query functions
module.exports = {
	getAllTrucks: getAllTrucks,
	// getTruck: getTruck,
	// createTruck: createTruck,
	// updateTruck: updateTruck,
	// deleteTruck: deleteTruck
};