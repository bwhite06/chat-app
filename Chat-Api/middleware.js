const jwt = require('jsonwebtoken');

const jwtKey = require('./_secrets/keys.js');

// quickly see what this file exports
module.exports = {
  authenticate,
};

// implementation details
function authenticate(req, res, next) {
  const token2 = req.get('Authorization');
  const token = req.headers.authorization.split(' ')[1]
console.log(token)
  if (token) {
    jwt.verify(token, "Why", (err, decoded) => {
      console.log
      if (err) return res.status(401).json(err);

      req.decoded = decoded;
console.log(req.decoded)
      next();
    });
  } else {
    return res.status(401).json({
      error: 'No token provided, must be set on the Authorization Header',
    });
  }
}
