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
      
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });
});