const sinon = require('sinon');
const chai = require('chai');
chai.should();
const { handlePostRecord } = require('../postRecord');
const functions = require('firebase-functions');
const admin = require('firebase-admin');


describe('Post Record tests', () => {
  /**
   *  Mock some methods before each call
   */
  var sandbox;
  var stubFirestore;
  var stubCollection;
  var stubRecords;
  var stubProjects;
  var stubSet;
  var stubGet;
  var stubProjectData;
  var sendStub;
  var statusStub;
  var res;
  var statusResult;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stubFirestore = sandbox.stub();
    stubCollection = sandbox.stub();
    stubRecords = sandbox.stub();
    stubProjects = sandbox.stub();
    stubSet = sandbox.stub();
    stubGet = sandbox.stub();
    stubProjectData = sandbox.stub();
    sendStub = sandbox.stub();
    statusStub = sandbox.stub();

    sandbox.stub(admin, 'firestore').get(() => stubFirestore);
    stubFirestore.returns({ collection: stubCollection});
    stubCollection.withArgs('records').returns({ doc: stubRecords });
    stubCollection.withArgs('projects').returns({ where: stubProjects });
    stubRecords.returns({
      set: stubSet,
    });
    stubProjects.withArgs('repositories', 'array-contains', 'test project').returns({
      set: stubSet,
      get: stubGet
    });
    stubSet.callsFake(set => {
      console.log(`Writing ${set}`);
    });

    stubGet.callsFake(() => {
      return new Promise(resolve => {
        resolve({ data: stubProjectData });
      });
    });
    stubProjectData.returns({
      budget: 1000,
      name: 'test project',
      contributors: ['tester'],
      github: true
    });

    sandbox.stub(functions, 'config').returns({
      tasker_app_id: {
        value: process.env.TASKER_APP_ID
      }
    });

    /**
     *  Mock REST result object
     */
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
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Post record requests are handled', () => {

    it('Each record reduce project\'s budget', async () => {
      let validReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
          action: 'closed',
          description: 'A part of a new feature'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(validReq, res);
      statusStub.calledWith(200).should.be.ok;

    });

    it('Validate record method gets called for request', async () => {
      let validReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          action: 'closed',
          timestamp: '2020-06-12T12:45:00Z',
          description: 'A part of a new feature'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(validReq, res);
      statusStub.calledWith(200).should.be.ok;
      stubSet.calledWith({budget: 940}, {merge: true}).should.be.ok;
    });
  });

  describe('Validation failures are handled', () => {

    it('If project data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          amount: 60,
          issue: 1,
          action: 'closed',
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If action data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
          description: 'A part of a new feature'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If githubUser data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          project: 'test project',
          amount: 60,
          issue: 1,
          action: 'closed',
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If amount data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          issue: 1,
          action: 'closed',
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If issue data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          action: 'closed',
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If timestamp data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          action: 'closed',
          issue: 1,
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If description data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          action: 'closed',
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If method field is incorrect, "Invalid method" message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          action: 'closed',
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z'
        },
        method: 'GET',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };
      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Invalid method').should.be.ok;
    });

    it('If authorization is not given "Unauthorized" message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          action: 'closed',
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z'
        },
        method: 'POST',
        headers: {
        }
      };
      await handlePostRecord(invalidReq, res);
      statusStub.calledWith(403).should.be.ok;
      sendStub.calledWith('Unauthorized').should.be.ok;
    });
  });
});