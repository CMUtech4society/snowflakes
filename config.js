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
  knexOptions = {
    client: 'mysql',
    connection: process.env.CLEARDB_DATABASE_URL
  };

module.exports = {
  baseUrl: '/snowflakes',
  title: process.env.TITLE || 'Snow Flakes Backend',
  cookieSecret: process.env.HEROKU_SECRET || 'keyboards cat',
  knexConfiguration
};
