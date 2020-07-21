const sinon = require('sinon');
const chai = require('chai');
chai.should();
const admin = require('firebase-admin');
const functions = require('firebase-functions');
const getProject = require('../getProject');


describe('getProject',() => {
  var sandbox;
  var sendStub;
  var statusStub;
  var res;
  var statusResult;
  var stubFirestore;
  var stubCollection;
  var stubDoc;
  var stubGet;
  var stubProject1Data;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stubFirestore = sandbox.stub();
    stubCollection = sandbox.stub();
    stubDoc = sandbox.stub();
    stubGet = sandbox.stub();
    stubProject1Data = sandbox.stub();
    stubProject1Data.returns({
      name: 'project1',
      budget: 1000,
      github: true,
      contributors: [
        'testuser1',
        'testuser2',
        'testuser3',
      ],
      dev: 50,
      ux: 50,
      testautomation: 50,
      bug: 50,
      documentation: 50,
      question: 50,
      design: 50,
      review: 50,
      accepted: 10
    });
    sandbox.stub(admin, 'firestore').get(() => stubFirestore);
    stubFirestore.returns({ collection: stubCollection });
    stubCollection.withArgs('projects').returns({ doc: stubDoc });
    stubDoc.withArgs('project1').returns({ get: stubGet });
    stubDoc.withArgs('project2').returns({});
    stubGet.callsFake(() => {
      return new Promise(resolve => {
        resolve({data: stubProject1Data});
      });
    });
    sendStub = sandbox.stub().callsFake(message => {
      console.log(message);
    });

    statusResult = {
      send: sendStub
    };

    statusStub = sandbox.stub().callsFake(code => {
      console.log('Status called with ' + code);
      return statusResult;
    });

    res = {
      status: statusStub,
      message: '',
      json: ''
    };

    sandbox.stub(functions, 'config').returns({
      tasker_app_id: {
        value: process.env.TASKER_APP_ID
      }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
  it('Return project\'s configurations', async () => {
    let req = {
      body: {
        project: 'project1',
      },
      method: 'POST',
      headers: {
        authorization: process.env.TASKER_APP_ID
      }
    };
    await getProject(req, res);
    statusStub.calledWith(200).should.be.ok;
    sendStub.calledWith(stubProject1Data()).should.be.ok;
  });

  it('Returns 403 if not authorized', async () => {
    let req = {
      body: {
        project: 'project1',
      },
      method: 'POST',
      headers: {
        authorization: 'wrong_id'
      }
    };
    await getProject(req, res);
    statusStub.calledWith(403).should.be.ok;
    sendStub.calledWith('Unauthorized').should.be.ok;
  });

  it('Returns 400 if wrong method', async () => {
    let req = {
      body: {
        project: 'project1',
      },
      method: 'GET',
      headers: {
        authorization: process.env.TASKER_APP_ID
      }
    };
    await getProject(req, res);
    statusStub.calledWith(400).should.be.ok;
    sendStub.calledWith('Invalid method').should.be.ok;
  });
});