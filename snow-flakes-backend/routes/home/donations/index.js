var express = require('express');
var router = express.Router();
var paypal = require("./paypal")


/**
 * This router is mounted under .../home/donations, and expects auth mw
 */
router.get('/', (req, res, next) => {
  res.redirect(req.app.locals.baseUrl + '/home/donations/view');
});

router.get('/new', async (req, res, next) => {
  const field = "last_time_checked";
  const prev_date_obj = await req.db('setting').where({ field }).first() || {};
  const prev_date = prev_date_obj.value;
  const curr_date = new Date().toISOString()

  await req.db('setting').where({ field })
    .update({ value: curr_date });

  var n = await paypal.get_donations(prev_date, curr_date, req.db('donation'));
  console.log(n);

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
