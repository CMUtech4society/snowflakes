var express = require('express');
var router = express.Router();

var cors = require('cors');

var { findToken, validateToken } = require('./helpers');

var handler = async (req, res, next) => {
  console.log(req.method);
  var token = findToken(req);
  if (!token)
    return res.status(400).json({ error: 'No Credentials' });

  var validToken = await validateToken(req.db, token);
  if (!validToken)
    return res.status(403).json({ error: 'Bad Credentials' });

  var donations = await req.db('donation')
    .select(['name', 'when', 'amount', 'comment'])
    .where({ approved: true });

  res.json({ donations });
};

router.use(cors());
router.get('/donations', handler);
router.post('/donations', handler);

module.exports = router;
