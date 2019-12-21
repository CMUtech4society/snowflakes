var faker = require('faker');

async function fakeDonations(db) {
  var number = Math.ceil(Math.random() * 10);

  var donations = [];
  for (var i = 0; i < number; i++) {
    donations.push({
      name: faker.name.findName(),
      amount: faker.commerce.price(),
      approved: false,
      comment: faker.random.words(5),
    });
  }

  await db('donation').insert(donations);
  return number;
}

module.exports = fakeDonations;
