const request = require('request');
// const paypal_auth = require("../../../paypal_auth.json");

function get_auth_key(auth) {
  var { client_id, secret } = auth;
  const options = {
    url: "https://api.sandbox.paypal.com/v1/oauth2/token",
    method: "POST",
    headers: {
      "Accept-Language": "en_US",
      "Accept": "application/json"
    },
    form: {
      grant_type: "client_credentials"
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        const key = info.access_token;
        resolve(key);
      } else {
        console.error("Encountered problem generating Paypal key: " + JSON.stringify(response));
        reject(error);
      }
    }).auth(client_id, secret);
  });
}

function get_donation_request(key, prev_date, curr_date) {
  const options = {
    url: "https://api.sandbox.paypal.com/v1/reporting/transactions",
    method: "GET",
    qs: {
      start_date: prev_date,
      end_date: curr_date,
      transaction_status: "S"
    },
    headers: {
      "Authorization": "Bearer " + key,
      "Accept": "application/json"
    }
  };

  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        const info = JSON.parse(body);
        const transactions = info.transaction_details;
        resolve(transactions);
      } else {
        console.error("Encountered problem getting donations: " + JSON.stringify(response));
        if (body)
          reject(JSON.stringify(JSON.parse(body), null, 2));
        // else
          // reject(JSON.stringify(response, null, 2));
        else
          reject('Did not get message body in the response from Paypal');
      }
    });
  });
}

async function get_donations(credentials, prev_date, curr_date, db) {
  var num_donations = 0;

  var key = await get_auth_key(credentials);
  var transactions = await get_donation_request(key, prev_date, curr_date);
  for (i = 0; i < transactions.length; i++) {
    const txn = transactions[i];
    const name = txn.payer_info.payer_name.full_name;
    const amt_obj = txn.transaction_info.transaction_amount;
    const amt_str = amt_obj.value + " " + amt_obj.currency_code;
    const comment = txn.transaction_info.transaction_note;

    var [ id ] = await db('donation').insert({
      "name": name,
      "amount": amt_str,
      "approved": false,
      "comment": comment
    });

    num_donations++;
    console.log(num_donations);
  }

  console.log(num_donations);
  return num_donations;
}

module.exports.get_donations = get_donations;