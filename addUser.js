const admin = require('firebase-admin');
const functions = require('firebase-functions');

module.exports = async(data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  if (!data.uid) {
    throw new functions.https.HttpsError('invalid-argument',
      'Given data does not contain data.uid');
  }

  console.log(data);
  return admin.firestore().collection('users').doc(data.uid).set(data.data);
};