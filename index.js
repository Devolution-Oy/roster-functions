const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// HTTP Callable: Create a new user record into firestore
exports.addUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  if (!data.uid) {
    throw new functions.https.HttpsError('invalid-argument',
      'Given data does not contain data.uid');
  }

  console.log(data);
  return admin.firestore().collection('users').doc(data.uid).set(data.data);
});

exports.deleteUser = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

exports.getUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  if (!data.uid) {
    throw new functions.https.HttpsError('invalid-argument',
      'Given data does not contain data.uid');
  }

  console.log(data);
  return admin.firestore().collection('users').doc(data.text).get();
});