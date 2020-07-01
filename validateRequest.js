async function validate(req, validateMethod, validateFunc, admin) {
  if (!req.headers.authorization) {
    console.error('No Firebase authorization token was passed in the request header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: <Firebase custom token>');
    return new Promise(resolve => {
      resolve({ code: 403, message: 'Unauthorized' });
    });
  }
  if (req.method !== validateMethod) {
    return new Promise(resolve => {
      resolve({ code: 400, message: 'Invalid method' });
    });
  }
  if (validateFunc && !validateFunc(req.body)) {
    return new Promise(resolve => {
      resolve({ code: 400, message: 'Invalid request' });
    });
  }

  try {
    await admin.auth().signInWithCustomToken(req.headers.authorization);
    console.log('ID Token correctly decoded');
    return new Promise(resolve => {
      resolve({ code: 200, message: 'OK' });
    });
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    return new Promise(resolve => {
      resolve({ code: 403, message: 'Unauthorized' });
    });
  }
}

module.exports = {
  validate
};
