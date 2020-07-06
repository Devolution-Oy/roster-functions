const admin = require('firebase-admin');
const functions = require('firebase-functions');

/**
 * List all registered users
 */
module.exports = async(context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  const users = await admin.firestore().collection('users').get();
  return users.docs.map(doc => doc.data());
};
