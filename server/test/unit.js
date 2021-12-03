import chai from 'chai';
import chaiHttp from 'chai-http';
import { authenticate } from '../middlewares/authenticate.js';

chai.should();
chai.use(chaiHttp);

describe('Unit tests', () => {
  describe('authenticate middleware', () => {
    it('should call the next middleware, if the user is authenticated', done => {
      const reqMock = {
        isAuthenticated: () => true,
      };

      const resMock = {
        status: code => resMock,
        end: () => done('response should not have been ended'),
      };

      const nextMock = () => done();

      authenticate(reqMock, resMock, nextMock);
    });

    it('should end the request with unauthorized response otherwise', done => {
      const reqMock = {
        isAuthenticated: () => false,
      };

      const resMock = {
        status: code => resMock,
        end: () => done(),
      };

      const nextMock = () => done('next should not have been called');

      authenticate(reqMock, resMock, nextMock);
    });
  });
});
