var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('New Thread in an unexistent Board', function(done) {
       chai.request(server)
        .post('/api/threads/FunctionalTesting')
        .send({
         name: "FunctionalTesting",
         text: "This is a test",
         delete_password: "QA"
        })
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.body.thread[0].text, "This is a test");
         assert.equal(res.body.thread[0].delete_password, "QA");
         done();
        });
      });
    });
    
    suite('GET', function() {
      test('Get Threads from Board', function(done) {
       chai.request(server)
        .get('/api/threads/FunctionalTesting')
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.body[0].text, "This is a test");
         assert.equal(res.body[0].delete_password, undefined);
         assert.equal(Array.isArray(res.body[0].replies), true);
         done();
        });
      });
    });
    
    suite('PUT', function() {
      //This makes no sense, I have to check the ID everytime I create a new Thread
    });
    
    suite('DELETE', function() {
      //This makes no sense, I have to check the ID everytime I create a new Board
    });
  });
});