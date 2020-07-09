const admin = require('firebase-admin');
const functions = require('firebase-functions');

const validateProject = data => {
  if (!data.name ||
    !data.budget) {
    return false;
  }
  return true;
};

module.exports = async(data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  console.log(data);
  if (!validateProject(data)) {
    throw new functions.https.HttpsError('invalid-argument',
      'Check the input data!');
  }
  
  return admin.firestore().collection('projects').doc(data.name).set(data);
};