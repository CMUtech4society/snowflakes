function findToken(req) {
  if (req.headers['X-token'])
    return req.headers['X-token'];

  if (req.query.token)
    return req.query.token;

  if (req.body.token)
    return req.body.token;
}

async function validateToken(db, code) {
  var result = await db('key').where({ code }).first();
  return !!result;
}

module.exports = {
  findToken,
  validateToken
};
