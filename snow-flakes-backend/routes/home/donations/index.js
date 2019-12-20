var express = require('express');
var router = express.Router();
var paypal = require("./paypal")


/**
 * This router is mounted under .../home/donations, and expects auth mw
 */
router.get('/', (req, res, next) => {
  res.redirect(req.app.locals.baseUrl + '/home/donations/view');
});

async function getDBSetting(db, field) {
  var row = await db('setting').where({ field }).first();
  return row.value;
}

router.get('/new', async (req, res, next) => {
  var { db } = req;
  var [ client_id, secret ] = await Promise.all([
    getDBSetting(db, 'paypal_client_id'), getDBSetting(db, 'paypal_secret'),
  ]);

  if (!client_id || !secret) {
    var msg = 'The paypal_client_id or paypal_secret setting is missing. ' +
      'Create them on Paypal and add them in the settings page.';
    req.flash('donations/view', { title: 'Error', msg });
    res.redirect(req.app.locals.baseUrl + '/home/donations');
    return;
  }

  const field = "last_time_checked";
  const prev_date_obj = await req.db('setting').where({ field }).first() || {};
  const prev_date = prev_date_obj.value;

  await db('setting').where({ field }).update({ value: new Date() });

  try {
    var n = await paypal.get_donations({
      client_id,
      secret
    }, prev_date, new Date(), db);
    console.log(n);
  } catch (e) {
    var error = new Error('PayPal Error');
    error.extra = e;
    return next(error);
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
