const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const sinon = require('sinon');
const chai = require('chai');

describe('getProjects', () => {
  var sandbox;
  var recordsData;
  var stubRecord1Data;
  var stubRecord2Data;
  var stubRecord3Data;
  var stubFirestore;
  var stubCollection;
  var stubWhere;
  var stubOrderBy;
  var stubGet;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    stubRecord1Data = sandbox.stub();
    stubRecord2Data = sandbox.stub();
    stubRecord3Data = sandbox.stub();
    stubFirestore = sandbox.stub();
    stubCollection = sandbox.stub();
    stubWhere = sandbox.stub();
    stubOrderBy = sandbox.stub();
    stubGet = sandbox.stub();

    stubRecord1Data.returns({
      amount: 49.00,
      description: 'Test record1',
      githubUser: 'tester1',
      issue: '1',
      project: 'project1',
      timestamp: 1590743660527
    });
    stubRecord2Data.returns({
      amount: 50.00,
      description: 'Test record2',
      githubUser: 'tester1',
      issue: '2',
      project: 'project1',
      timestamp: 1594207334619
    });
    stubRecord3Data.returns({
      amount: 51.95,
      description: 'Test record3',
      githubUser: 'tester1',
      issue: 3,
      project: 'project1',
      timestamp: 1589528775425
    });
    recordsData = [
      { data: stubRecord1Data },
      { data: stubRecord2Data },
      { data: stubRecord3Data },
    ];

    sandbox.stub(admin, 'firestore').get(() => stubFirestore);
    stubFirestore.returns({ collection: stubCollection });
    stubCollection.withArgs('records').returns({ where: stubWhere });
    stubWhere.withArgs('project', '==', 'project1').returns({ orderBy: stubOrderBy });
    stubOrderBy.returns({ get: stubGet });
    stubGet.callsFake(() => {
      return new Promise(resolve => {
        resolve(recordsData);
      });
    });
  });

  afterEach(() => {
    sandbox.restore();
    test.cleanup();
  });

  it('It returns array of records', async () => {
    const getRecords = require('../getRecords.js');
    const data = 'project1';
    await getRecords(data, {
      auth: {
        uid: 'LoR1xY535HP6gNJNRBokMfhD8343',
        token: '123456'
      }
    }).then(records => {
      chai.assert.equal(3, records.length);
      records.forEach(record => {
        chai.assert.exists(record.amount);
        chai.assert.exists(record.description);
        chai.assert.isDefined(Date.parse(record.date));
      });
      return true;
    }).catch(err => {
      throw chai.assert.fail(err.message);
    });
  });
});