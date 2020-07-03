const sinon = require('sinon');
const chai = require('chai');
chai.should();
const handlePostRecord = require('../postRecord');
const functions = require('firebase-functions');


const sandbox = sinon.createSandbox();

describe('Post Record tests', () => {
  /**
   *  Mock some methods before each call
   */
  const set = sandbox.stub().callsFake(record => {
    console.log(`Writing ${record}`);
  });
  const doc = (_name) => {
    return { set };
  };
  const collection = (_name) => {
    return { doc };
  };
  const admin = {
    firestore: () => {
      return { collection };
    }
  };

  sandbox.stub(functions, 'config').returns({
    tasker_app_id: {
      value: process.env.TASKER_APP_ID
    }
  });

  const sendStub = sandbox.stub().callsFake(message => {
    console.log(message);
  });

  var statusResult = {
    send: sendStub
  };

  var message = '';

  /**
   *  Mock REST result object
   */
  const statusStub = sandbox.stub().callsFake(code => {
    console.log('Status called with ' + code);
    return statusResult;
  });

  const res = {
    status: statusStub,
    message: message,
  };
  
  beforeEach(() => {
    set.resetHistory();
    statusStub.resetHistory();
    sendStub.resetHistory();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Post record requests are handled', () => {

    it('Validate record method gets called for request', async () => {
      let validReq = {
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

      await handlePostRecord(validReq, res, admin);
      statusStub.calledWith(200).should.be.ok;
    });
  });

  describe('Validation failures are handled', () => {

    it('If project data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If githubUser data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If amount data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If issue data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          timestamp: '2020-06-12T12:45:00Z',
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If timestamp data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          description: 'Test'
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If description data field is missing, Bad Request message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z',
        },
        method: 'POST',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };

      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Bad Request').should.be.ok;
    });

    it('If method field is incorrect, "Invalid method" message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z'
        },
        method: 'GET',
        headers: {
          authorization: process.env.TASKER_APP_ID
        }
      };
      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Invalid method').should.be.ok;
    });

    it('If authorization is not given "Unauthorized" message is sent', async () => {
      let invalidReq = {
        body: {
          githubUser: 'tester',
          project: 'test project',
          amount: 60,
          issue: 1,
          timestamp: '2020-06-12T12:45:00Z'
        },
        method: 'POST',
        headers: {
        }
      };
      await handlePostRecord(invalidReq, res, admin);
      statusStub.calledWith(403).should.be.ok;
      sendStub.calledWith('Unauthorized').should.be.ok;
    });

  });
});