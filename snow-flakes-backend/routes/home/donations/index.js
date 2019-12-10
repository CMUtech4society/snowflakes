var express = require('express');
var router = express.Router();

/**
 * This router is mounted under .../home/donations, and expects auth mw
 */
router.get('/', (req, res, next) => {
  res.redirect(req.app.locals.baseUrl + '/home/donations/view');
});

router.get('/new', async (req, res, next) => {
  var n = Math.ceil(Math.random() * 10);

  var field = 'paypal_api_key';
  var { value } = await req.db('setting').where({ field }).first() || {};

  if (!value) {
    req.flash('donations/view', {
      title: 'Error',
      msg: 'Missing paypal_api_key setting'
    });

    res.redirect(req.app.locals.baseUrl + '/home/donations');
    return;
  }

  req.flash('donations/view', { title: 'Success', msg: 'Got ' + n + ' new donations.' });
  res.redirect(req.app.locals.baseUrl + '/home/donations');
});

router.get('/view', async (req, res, next) => {
  var donations = await req.db('donation').select('*');
  res.render('home/donationsview', {
    donations,
    view: req.flash('donations/view')
  });
});

router.get('/donation/:id/approval', async (req, res, next) => {
  if (req.params.id)
    await req.db('donation').update({
      approved: req.db.raw('not ??', ['approved'])
    });
  res.redirect(req.app.locals.baseUrl + '/home/donations');
});

router.post('/donation/:id/comment', async (req, res, next) => {
  var { comment } = req.body;

  if (!comment)
    return next(new Error("Missing comment"));

  await req.db('donation').update({ comment });
  res.redirect(req.app.locals.baseUrl + '/home/donations');
});

module.exports = router;
