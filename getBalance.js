const admin = require('firebase-admin');
const functions = require('firebase-functions');

const formatTime = timestamp => {
  var a = new Date(timestamp);
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec;
  return time;
};

module.exports = async(data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  // TODO: Sort records by date
  const githubUser = data.user;
  return admin.firestore().collection('records').where('githubUser', '==', githubUser)
    .get().then(query => {

      var records = [];
      var balance = 0;
      query.forEach(entry => {
        data = entry.data();
        balance = balance + data.amount;
        var record = {
          date: null,
          description: null,
          amount: null
        };

        record.date = formatTime(data.timestamp);
        record.description = data.project + ' ' + data.issue;
        record.amount = data.amount;
        records.push(record);
      });

      var result = {
        total: balance,
        records: records
      };

      return new Promise(resolve => {
        resolve(result);
      });
    });
};
