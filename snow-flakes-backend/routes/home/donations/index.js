var express = require('express');
var router = express.Router();
var paypal = require("./paypal")

var moment = require('moment');

/**
 * This router is mounted under .../home/donations, and expects auth mw
 */
router.get('/', async (req, res, next) => {
  res.redirect(req.app.locals.baseUrl + '/home/donations/view');
});

router.get('/view', async (req, res, next) => {
  var donations = await req.db('donation').select('*');
  res.render('home/donationsview', {
    donations,
    view: req.flash('donations/view')
  });
});

async function getDBSetting(db, field) {
  var row = await db('setting').where({ field }).first();
  return row ? row.value : null;
}

router.get('/new', async (req, res, next) => {
  var { db } = req;

  var client_id, secret, prev_date;
  // // fetch paypal credentials
  //   var [ client_id, secret ] = await Promise.all([
  //     getDBSetting(db, 'paypal_client_id'), getDBSetting(db, 'paypal_secret'),
  //   ]);

  // // for use in constructing objects
  // var msg = undefined;

  // // if no credentials, do not continue
  // if (!client_id || !secret) {
  //   msg = 'The paypal_client_id or paypal_secret setting is missing. ' +
  //     'Create them on Paypal and add them in the settings page.';
  //   req.flash('donations/view', { title: 'Error', msg });
  //   res.redirect(req.app.locals.baseUrl + '/home/donations');
  //   return;
  // }

  // // for knex object 
  // const field = "last_time_checked";
  // // by default, go as far back as Paypal lets you in one go (as a float)
  // const def_last_time_checked = moment().subtract(30, 'days').toDate().getTime();
  // // get our last_time_checked or use the default
  // const prev_date_obj = await getDBSetting(db, field) || def_last_time_checked;
  // // if necessary, parse the float from the database
  // const prev_date = new Date(parseFloat(prev_date_obj));

  // // determine whether or not the setting is already there
  // // instead of doing flavor specific sql syntax
  // var fc = await db('setting').count().where({ field }).first();
  // var have = fc[Object.keys(fc)[0]];

  // // insert if not, update row if present
  // if (have) {
  //   console.log('updated last_time_checked');
  //   await db('setting').where({ field }).update({ value: new Date() });
  // } else {
  //   console.log('inserted last_time_checked');
  //   await db('setting').insert({ field, value: new Date().getTime() });
  // }

  // try to get donations, or show error with extra field for paypal info
  try {
    var n = await paypal.get_donations({
      client_id,
      secret
    }, prev_date, new Date(), db, true);
    console.log(n);
  } catch (e) {
    var error = new Error('PayPal Error');
    error.extra = e;
    return next(error);
  }

  // construct message with calendar dates
  msg = [
    'Got ', n, ' new donations, between ',
    moment(prev_date).calendar(), 'and', moment().calendar()
  ].join(' ');

  req.flash('donations/view', { title: 'Success', msg });
  res.redirect(req.app.locals.baseUrl + '/home/donations');
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
