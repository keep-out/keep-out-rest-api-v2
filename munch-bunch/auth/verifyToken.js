var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
	var token = req.headers['x-access-token'];
	if (!token) {
		return res.status(403).json({
			auth: false,
			message: 'No token provided.'
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, 
		function(err, decoded) {

		if (err) {
			return res.status(500).json({
				auth: false,
				message: 'Failed to authenticate token.'
			});
		}

		next();
	});
}

module.exports = {
	verifyToken: verifyToken
}