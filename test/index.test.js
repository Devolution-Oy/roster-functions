const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');

const myFunctions = require('../index');
const wrapped = test.wrap(myFunctions.addUser);

const validRecord = {
  uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
  data: {
    githubUser: 'tester',
    displayName: 'Test User',
    email: 'test@test.fi',
    photo: 'https://testurl.fi',
    projects:[],
    role: 1,
  } 
};


describe('User records are stored into firestore',() => {
  const firestoreStub = sinon.stub();
  const collectionStub = sinon.stub();
  const collectionArg = 'users';
  const docStub = sinon.stub();
  const setStub = sinon.stub();

  Object.defineProperty(admin, 'firestore', { get: () => firestoreStub });
  firestoreStub.returns({ collection: collectionStub });
  collectionStub.withArgs(collectionArg).returns({ doc: docStub });
  docStub.withArgs(validRecord.uid).returns({ set: setStub });
  setStub.withArgs(validRecord.data).returns(true);

  it('Valid user data from authenticated user is writtend to firestore', () => {

    chai.assert.equal(wrapped(validRecord, {
      auth: {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      },
    }),true);
  });
});
