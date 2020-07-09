const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');
const sandbox = sinon.createSandbox();


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
  let oldFirestore;
  let myFunctions;
  before(() => {
    oldFirestore = admin.firestore;
    myFunctions = require('../index.js');
  });

  after(() => {
    admin.firestore = oldFirestore;
    test.cleanup();
    sandbox.restore();
  });

  const collectionStub = sandbox.stub();
  const firestoreStub = sandbox.stub();
  const collectionArg = 'users';
  const docStub = sandbox.stub();
  const setStub = sandbox.stub();

  Object.defineProperty(admin, 'firestore', { get: () => firestoreStub });
  firestoreStub.returns({ collection: collectionStub });
  collectionStub.withArgs(collectionArg).returns({ doc: docStub });
  docStub.withArgs(validRecord.uid).returns({ set: setStub });
  setStub.withArgs(validRecord.data).returns( new Promise(resolve => {
    resolve(true);}));

  it('Valid user data from authenticated user is writtend to firestore', () => {
    const wrapped = test.wrap(myFunctions.addUser);
    wrapped(validRecord, {
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
