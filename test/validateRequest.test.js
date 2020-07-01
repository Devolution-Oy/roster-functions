const sinon = require('sinon');
const chai = require('chai');
chai.should();

const validateRequest = require('../validateRequest');
const sandbox = sinon.createSandbox();


describe('REST call validation', async () => {
  const stubSignInWithCustomToken = sandbox.stub().callsFake(token => {
    if (!token) throw new Error('No token');

    return true;
  });
  const stubAuth = sandbox.stub().callsFake(() => {
    return { signInWithCustomToken: stubSignInWithCustomToken };
  });

  const stubAdmin = {
    auth: stubAuth
  };

  const dummyValidator = data => {
    if (!data) return false;

    return true;
  };

  const falseValidator = data => {
    if (!data) return false;

    return false;
  };

  after(() => {
    sandbox.restore();
  });

  it('Valid request returns OK and set request user', async () => {
    const request = {
      body: {
        githubUser: 'tester',
        project: 'test project',
        amount: 60,
        issue: 1,
        timestamp: '2020-06-12T12:45:00Z'
      },
      method: 'POST',
      headers: {
        authorization: '12345kjhtg'
      }
    };

    let res = await validateRequest.validate(
      request,
      'POST',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(200);
    res.message.should.equal('OK');
  });

  it('Error is returned if no authorization token is provided', async () => {
    let request = {
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

    let res = await validateRequest.validate(
      request,
      'POST',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(403);
    res.message.should.equal('Unauthorized');
  });

  it('Error is returned when validate function returns false', async () => {
    let request = {
      body: {
        githubUser: 'tester',
        project: 'test project',
        amount: 60,
        issue: 1,
        timestamp: '2020-06-12T12:45:00Z'
      },
      method: 'POST',
      headers: {
        authorization: '12345kjhtg'
      }
    };

    let res = await validateRequest.validate(
      request,
      'POST',
      falseValidator,
      stubAdmin);
    res.code.should.equal(400);
    res.message.should.equal('Invalid request');
  });

  it('Error is returned when request method is not expected', async () => {
    let request = {
      body: {
        githubUser: 'tester',
        project: 'test project',
        amount: 60,
        issue: 1,
        timestamp: '2020-06-12T12:45:00Z'
      },
      method: 'POST',
      headers: {
        authorization: '12345kjhtg'
      }
    };

    let res = await validateRequest.validate(
      request,
      'GET',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(400);
    res.message.should.equal('Invalid method');
  });
});
