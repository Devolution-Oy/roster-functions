const crypto = require('crypto-js');
const validateRequest = require('./validateRequest');

/*
  Validate new record post
*/
const validatePostBalance = data => {
  if (!data.githubUser 
    || !data.project
    || !data.amount
    || !data.issue
    || !data.timestamp)
    return false;

  return true;
};

module.exports = async(req, res, admin) => {
  const status = await validateRequest.validate(
    req,
    'POST',
    validatePostBalance,
    admin);

  if (status.code !== 200) {
    res.status(status.code).send(status.message);
    return false;
  }
      
  try {
    let data = req.body;
    const hash = crypto.MD5(data.githubUser + data.project + data.issue);
    admin.firestore().collection('records').doc(hash.toString()).set(data);
    res.status(200).send('OK (' + hash.toString() + ')');
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};