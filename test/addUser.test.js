const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');

const validRecord = {
  uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
  data: {
    githubUser: 'tester',
    displayName: 'Test User',
    email: 'test@test.fi',
    photo: 'https://testurl.fi',
    role: 1,
  } 
};

// TODO: Add unit tests for error cases
describe('User records are stored into firestore',() => {
  var sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    test.cleanup();
  });

  it('Valid user data from authenticated user is writtend to firestore', async () => {
    const collectionStub = sandbox.stub();
    const firestoreStub = sandbox.stub();
    const collectionArg = 'users';
    const docStub = sandbox.stub();
    const setStub = sandbox.stub();

    sandbox.stub(admin, 'firestore').get(() => firestoreStub);
    firestoreStub.returns({ collection: collectionStub });
    collectionStub.withArgs(collectionArg).returns({ doc: docStub });
    docStub.withArgs(validRecord.uid).returns({ set: setStub });
    setStub.withArgs(validRecord.data).returns(new Promise(resolve => {
      resolve(true);
    }));

    const addUser = require('../addUser.js');
    await addUser(validRecord, {
      auth: {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      },
    }).then(res => {
      return chai.assert.equal(res, true);
    }).catch(err => {
      console.log(err);
      throw chai.assert.fail('Shouldn\'t be here');
    });
  });
});
