var express = require('express');
var router = express.Router();

var cors = require('cors');
var fs = require('fs');
var path = require('path');

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

// var script = undefined;
router.get('/script', (req, res, next) => {
  var baseUrl = req.app.locals.baseUrl;
  var donationsUrl = baseUrl + '/api/donations';
  // if (!script)
  var script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  res.send([
    "window.SNOWFLAKES = window.SNOWFLAKES || {};",
    "window.SNOWFLAKES.donationsUrl = '" + donationsUrl + "';",
    script
  ].join('\n'));
});

router.use((err, req, res, next) => {
  res.status(500).json({
    status: 'error',
    error: err
  });
});

module.exports = router;
