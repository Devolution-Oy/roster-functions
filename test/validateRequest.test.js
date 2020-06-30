const sinon = require('sinon');
const chai = require('chai');
chai.should();

const validateRequest = require('../validateRequest');
const sandbox = sinon.createSandbox();


describe('REST call validation', async () => {
  const stubVerifyIdToken = sandbox.stub().callsFake(token => {
    if (!token) return 'No token';

    return 'tester';
  });
  const stubAuth = sandbox.stub().callsFake(() => {
    return { verifyIdToken: stubVerifyIdToken };
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
        authorization: 'Bearer 12345kjhtg'
      }
    };

    let res = await validateRequest.validate(
      request,
      'POST',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(200);
    res.message.should.equal('OK');
    res.user.should.equal('tester');
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
      },
      user: ''
    };

    let res = await validateRequest.validate(
      request,
      'POST',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(403);
    res.message.should.equal('Unauthorized');
    res.user.should.equal('');
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
        authorization: 'Bearer 12345kjhtg'
      },
      user: ''
    };

    let res = await validateRequest.validate(
      request,
      'POST',
      falseValidator,
      stubAdmin);
    res.code.should.equal(400);
    res.message.should.equal('Invalid request');
    res.user.should.equal('');
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
        authorization: 'Bearer 12345kjhtg'
      },
      user: ''
    };

    let res = await validateRequest.validate(
      request,
      'GET',
      dummyValidator,
      stubAdmin);
    res.code.should.equal(400);
    res.message.should.equal('Invalid method');
    res.user.should.equal('');
  });

});

describe('extractToken method', () => {
  it('Returns token part of the Bearer token', () => {
    const token = validateRequest.extractToken('Bearer 12368765');
    token.should.equal('12368765');
  });

  it('Return empty string for invalid Bearer token', () => {
    const tokenNotBearer = validateRequest.extractToken('Beer 12368765');
    tokenNotBearer.should.equal('');
    const tokenNotExist = validateRequest.extractToken('');
    tokenNotExist.should.equal('');
  });
});