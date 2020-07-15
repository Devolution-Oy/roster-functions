const admin = require('firebase-admin');

/**
 * List all registered users
 */
module.exports = async(user, context) => {
  console.log(context);

  return admin.firestore().collection('projects').get().then(projects => {
    const projectsData = projects.docs.map(doc => doc.data());
    const userProjects = projectsData.filter(project => {
      return (project.contributors.includes(user) || !user);
    });
    return userProjects;
  });
};
