const sinon = require('sinon');
const chai = require('chai');
chai.should();
const validateRequest = require('../validateRequest');
const handlePostRecord = require('../postRecord');

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

  const validateStub = sandbox.stub(validateRequest, 'validate')
    .callsFake((req, _validateMethod, _validateFunc, _admin) => {
      if (req.body.project) {
        return new Promise(resolve => {
          resolve({ code: 200, message: 'OK', user: 'tester' });
        });
      } else {
        return new Promise(resolve => {
          resolve({ code: 400, message: 'Some information missing', user: '' });
        });
      }
    });
  
  beforeEach(() => {
    validateStub.resetHistory();
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
          timestamp: '2020-06-12T12:45:00Z'
        },
        method: 'POST',
        headers: {
          authorization: 'Bearer 12345kjhtg'
        }
      };

      await handlePostRecord(validReq, res, admin);
      validateStub.called.should.be.ok;
      statusStub.calledWith(200).should.be.ok;
    });
  });

  describe('Validation failures are handled', () => {

    let invalidReq = {
      body: {
        githubUser: 'tester',
        amount: 60,
        issue: 1,
        timestamp: '2020-06-12T12:45:00Z'
      },
      method: 'POST',
      headers: {
        authorization: 'Bearer 12345kjhtg'
      }
    };

    it('If validation returns NOK error message from validation is given', async () => {
      await handlePostRecord(invalidReq, res, admin);
      validateStub.called.should.be.ok;
      statusStub.calledWith(400).should.be.ok;
      sendStub.calledWith('Some information missing').should.be.ok;
    });

    it('If validation returns NOK error message, return false', async () => {
      let ret = await handlePostRecord(invalidReq, res, admin);
      ret.should.be.false;
      statusStub.calledWith(400).should.be.ok;
      set.called.should.not.be.ok;
    });
  });
});