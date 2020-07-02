const crypto = require('crypto-js');
const functions = require('firebase-functions');


/*
  Validate new record post
*/
const validatePostBalance = req => {
  const tasker_app_id = functions.config().tasker_app_id.value;

  if (!req.headers.authorization || req.headers.authorization !== tasker_app_id) {
    console.log('Received header ' + req.headers.authorization);
    console.log(tasker_app_id);
    console.error('No authorization token was passed in the request header or the token is not correct.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: <TASKER_APP_ID>');
    return { code: 403, message: 'Unauthorized' };
  }

  if (req.method !== 'POST') {
    return { code: 400, message: 'Invalid method' };
  }

  if (!req.body.githubUser 
    || !req.body.project
    || !req.body.amount
    || !req.body.issue
    || !req.body.timestamp) {
    return { code: 400, message: 'Bad Request' };
  }

  return { code: 200, message: 'OK' };
};

module.exports = async(req, res, admin) => {
  const status = validatePostBalance(req);

  if (status.code !== 200) {
    res.status(status.code).send(status.message);
  } else {
    try {
      let data = req.body;
      const hash = crypto.MD5(data.githubUser + data.project + data.issue);
      admin.firestore().collection('records').doc(hash.toString()).set(data);
      res.status(200).send('OK (' + hash.toString() + ')');
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
};