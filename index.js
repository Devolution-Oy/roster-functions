const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { handlePostRecord, postCustomRecord } = require('./postRecord');
const addUser = require('./addUser');
const getBalance = require('./getBalance');
const getUsers = require('./getUsers');
const getProjects = require('./getProjects');
const updateProject = require('./updateProject');


admin.initializeApp();

// HTTP Callable: Create a new user record into firestore
exports.addUser = functions.https.onCall((data, context) => {
  return addUser(data, context);
});

exports.deleteUser = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

exports.getUsers = functions.https.onCall((data, context) => {
  return getUsers(context);
});

async function getUserData(uid) {

  const getUserInfo = uid => {
    return admin.firestore().collection('users').doc(uid).get();
  };

  const user = await getUserInfo(uid);

  const userData = {
    githubUser: user.data().githubUser,
    role: user.data().role,
    displayName: user.data().displayName,
    photo: user.data().photo,
    email: user.data().email,
    projects: user.data().projects
  };
  console.log(userData);
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

exports.getProjects = functions.https.onCall((data, context) => {
  return getProjects(data, context);
});

exports.getUserBalance = functions.https.onCall((data, context) => {
  return getBalance(data, context);
});

exports.postRecord = functions.https.onRequest((req, res) => {
  return handlePostRecord(req,res, admin);
});

exports.postCustomRecord = functions.https.onCall((data, context) => {
  return postCustomRecord(data, context); 
});

exports.updateProject = functions.https.onCall((data, context) => {
  return updateProject(data, context);
});