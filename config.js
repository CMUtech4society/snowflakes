require('dotenv').config({ path: require('path').join(__dirname, '.env') });


var knexConfiguration = {
  client: 'sqlite3',
  connection: 'database.db',
  useNullAsDefault: true
  // client: 'mysql',
  // connection: {
  //   user: process.env['user'],
  //   password: process.env['password'],
  //   database: process.env['database']
  // }
};

if (process.env.HEROKU)
  knexConfiguration = {
    client: 'mysql',
    connection: process.env.CLEARDB_DATABASE_URL
  };
knexConfiguration = {
  client: 'mysql',
  connection: 'mysql://b243aefe6719cb:726b842b@us-cdbr-iron-east-05.cleardb.net/heroku_01e2a877ab54da8?reconnect=true'
};

module.exports = {
  baseUrl: '/snowflakes',
  title: process.env.TITLE || 'Snow Flakes Backend',
  cookieSecret: process.env.HEROKU_SECRET || 'keyboards cat',
  knexConfiguration
};
