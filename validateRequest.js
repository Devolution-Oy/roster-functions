const extractToken = (auth) => {
  if (auth && auth.startsWith('Bearer ')) {
    return auth.split('Bearer ')[1];
  }

  return '';
};

async function validate(req, validateMethod, validateFunc, admin) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>');
    return new Promise(resolve => {
      resolve({ code: 403, message: 'Unauthorized', user: '' });
    });
  }
  if (req.method !== validateMethod) {
    return new Promise(resolve => {
      resolve({ code: 400, message: 'Invalid method', user: '' });
    });
  }
  if (validateFunc && !validateFunc(req.body)) {
    return new Promise(resolve => {
      resolve({ code: 400, message: 'Invalid request', user: '' });
    });
  }

  try {
    let idToken = extractToken(req.headers.authorization);
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log('ID Token correctly decoded', decodedIdToken);
    return new Promise(resolve => {
      resolve({ code: 200, message: 'OK', user: decodedIdToken });
    });
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    return new Promise(resolve => {
      resolve({ code: 403, message: 'Unauthorized', user: '' });
    });
  }
}

module.exports = {
  validate,
  extractToken
};
