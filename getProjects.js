const admin = require('firebase-admin');
const functions = require('firebase-functions');

/**
 * List all registered users
 */
module.exports = async(user, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Unauthenticated');
  }

  return admin.firestore().collection('projects').get().then(projects => {
    const projectsData = projects.docs.map(doc => doc.data());
    const userProjects = projectsData.filter(project => {
      return (project.contributors.includes(user) || !user);
    });
    return userProjects;
  });
};
