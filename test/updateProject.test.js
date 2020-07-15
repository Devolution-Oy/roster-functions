const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');
const updateProject = require('../updateProject');
const sandbox = sinon.createSandbox();

// TODO: Refactor updateProject unit tests
describe('Update project', () => {
  before(() => {
  });

  after(() => {
    test.cleanup();
    sandbox.restore();
  });

  const data = { name: 'project1', budget: 1000 };
  const stubFirestore = sandbox.stub();
  const stubCollection = sandbox.stub();
  const collectionArg = 'projects';
  const stubDoc = sandbox.stub();
  const stubSet = sinon.stub();
  sandbox.stub(admin, 'firestore').get(() => stubFirestore);
  stubFirestore.returns({ collection: stubCollection });
  stubCollection.withArgs(collectionArg).returns({ doc: stubDoc });
  stubDoc.withArgs('project1').returns({ set: stubSet });
  stubSet.withArgs(data).returns(new Promise((resolve) => {
    resolve(true);
  }));

  it('Calls firestore document set() when data is correct', async () => {
    await updateProject(data, {
      auth:
      {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      }
    }).then(res => {
      return chai.assert.equal(res, true);
    }).catch(err => {
      console.log(err.message);
      throw chai.assert.fail('Shouldn\'t be here');
    });
  });

  it('Throws authentication error, if context does not authentication', async () => {
    await updateProject(data, {
    }).then(res => {
      console.log(res);
      throw chai.assert.fail('Shouldn\'t be here');
    }).catch(err => {
      return chai.assert.equal(err.message, 'Unauthenticated');
    });
  });

  it('Throws invalid data error, if data does not contain budget', async () => {
    const invalid = {
      name: 'test'
    };
    await updateProject(invalid, {
      auth:
      {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      }
    }).then(res => {
      console.log(res);
      throw chai.assert.fail('Shouldn\'t be here');
    }).catch(err => {
      return chai.assert.equal(err.message, 'Check the input data!');
    });
  });
});