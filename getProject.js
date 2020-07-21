const functions = require('firebase-functions');
const admin = require('firebase-admin');

module.exports = async (req, res) => {
  const tasker_app_id = functions.config().tasker_app_id.value;
  if (!req.headers.authorization || req.headers.authorization !== tasker_app_id) {
    console.log('Received header ' + req.headers.authorization);
    console.log(tasker_app_id);
    console.error('No authorization token was passed in the request header or the token is not correct.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: <TASKER_APP_ID>');
    return res.status(403).send('Unauthorized');
  }

  if (req.method !== 'POST') {
    return res.status(400).send('Invalid method');
  }

  console.log(req.body.project);
  const doc = await admin.firestore().collection('projects').doc(req.body.project).get();
  if (doc.data()) 
    return res.status(200).send(doc.data());
  else
    return res.status(500).send('The project was not found');
};