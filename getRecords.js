const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { formatTimestamp } = require('./utils/formatTimestamp');

module.exports = async (project, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  return admin.firestore()
    .collection('records')
    .where('project', '==', project)
    .orderBy('timestamp', 'desc')
    .get()
    .then(query => {
      var records = [];
      var data;
      query.forEach(entry => {
        data = entry.data();
        var record = {
          date: null,
          description: null,
          amount: null
        };

        record.date = formatTimestamp(data.timestamp);
        record.description = data.project + ' (' + data.issue + '): ' + data.description;
        record.amount = data.amount;
        records.push(record);
      });

      return new Promise(resolve => {
        resolve(records);
      });
    });
};