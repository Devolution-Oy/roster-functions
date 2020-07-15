const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');


describe('getProjects', () => {
  var sandbox;
  var stubProject1Data;
  var stubProject2Data;
  var stubProject3Data;
  var projects;
  var stubFirestore;
  var stubCollection;
  var stubGet;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stubProject1Data = sandbox.stub();
    stubProject2Data = sandbox.stub();
    stubProject3Data = sandbox.stub();
    stubProject1Data.returns({
      name: 'project1',
      budget: 1000,
      github: true,
      contributors: [
        'testuser1',
        'testuser2',
        'testuser3',
      ]
    });

    stubProject2Data.returns({
      name: 'project2',
      budget: 2000,
      github: true,
      contributors: [
        'testuser2',
        'testuser3',
      ]
    });

    stubProject3Data.returns({
      name: 'project3',
      budget: 3000,
      github: false,
      contributors: [
        'testuser3',
      ]
    });

    projects = {
      docs: [
        { data: stubProject1Data },
        { data: stubProject2Data },
        { data: stubProject3Data },
      ]
    };
    stubFirestore = sandbox.stub();
    stubCollection = sandbox.stub();
    stubGet = sinon.stub();

    sandbox.stub(admin, 'firestore').get(() => stubFirestore);
    stubFirestore.returns({ collection: stubCollection });
    stubCollection.withArgs('projects').returns({ get: stubGet });
    stubGet.callsFake(() => {
      return new Promise(resolve => {
        resolve(projects);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
    test.cleanup();
  });

  it('It returns all projects if no user given', async () => {
    const getProjects = require('../getProjects.js');
    const data = null;
    await getProjects(data, {
      auth:
      {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      }
    }).then(projects => {
      return chai.assert.equal(3, projects.length);
    }).catch(err => {
      throw chai.assert.fail(err.message);
    });
  });

  it('It returns user\'s projects when user is given', async () => {
    const getProjects = require('../getProjects.js');
    const data = 'testuser1';
    await getProjects(data, {
      auth:
      {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      }
    }).then(projects => {
      chai.assert.equal(1, projects.length);
      chai.assert.equal(projects[0].contributors.includes('testuser1'), true);
      return true;
    }).catch(err => {
      chai.assert.fail(err.message);
      return false;
    });
  });
});