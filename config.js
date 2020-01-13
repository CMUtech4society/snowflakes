require('dotenv').config({ path: require('path').join(__dirname, '.env') });

module.exports = {
  baseUrl: '/snowflakes',
  title: 'Snow Flakes Backend',
  cookieSecret: 'keyboards cat',
  knexConfiguration: {
    client: 'sqlite3',
    connection: 'database.db',
    useNullAsDefault: true
    // client: 'mysql',
    // connection: {
    //   user: process.env['user'],
    //   password: process.env['password'],
    //   database: process.env['database']
    // }
  }
};
