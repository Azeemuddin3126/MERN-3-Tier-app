const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
chai.use(chaiHttp);
chai.should();

describe('GET /api/message', () => {
  it('should return the correct message', (done) => {
    chai.request(server)
      .get('/api/message')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('message').eql('Hello from the server!');
        done();
      });
  });
});
