const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto-js');

admin.initializeApp();

// TODO: Calculate balance when getUser is called
// TODO: Add APP id check on a postRecord

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

async function getUserData(uid) {

  const getUserInfo = uid => {
    return admin.firestore().collection('users').doc(uid).get();
  };

  const getBalance = githubUser => {
    return admin.firestore().collection('records').where('githubUser', '==', githubUser)
      .get().then(query => {
        var balance = 0;
        query.forEach(record => {
          balance = balance + record.data().amount;
        });
        return new Promise(resolve => {
          resolve(balance);
        });
      });
  };
  const user = await getUserInfo(uid);
  const balance = await getBalance(user.data().githubUser);

  const userData = {
    githubUser: user.data().githubUser,
    role: user.data().role,
    displayName: user.data().displayName,
    photo: user.data().photo,
    email: user.data().email,
    balance: balance
  };
  return new Promise((resolve) => {
    resolve(userData);
  });
}

exports.getUser = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  if (!data.uid) {
    throw new functions.https.HttpsError('invalid-argument',
      'Given data does not contain data.uid');
  }

  return getUserData(data.uid);
});

const validatePostBalance = data => {
  if (!data.githubUser 
    || !data.project
    || !data.amount
    || !data.issue
    || !data.timestamp)
    return false;

  return true;
};

exports.postRecord = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    res.status(400).send('Invalid request');
    return;
  }

  let data = req.body;

  if (!validatePostBalance(data)) {
    res.status(400).send('Invalid request');
    return;
  }

  const hash = crypto.MD5(data.githubUser + data.project + data.issue);
  admin.firestore().collection('records').doc(hash.toString()).set(data);
  res.status(200).send('OK (' + hash.toString() + ')');
});