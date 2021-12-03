process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { MongoMemoryServer } from 'mongodb-memory-server';

chai.should();
chai.use(chaiHttp);

let app;
let mongo;
let agent1;
let agent2;
let user1;
let user2;
let room1;
let room2;

describe('Integration tests', () => {
  before(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URL = mongo.getUri();
    ({ app } = await import('../index.js'));

    return new Promise(resolve => {
      app.on('initialized', () => {
        agent1 = chai.request.agent(app);
        agent2 = chai.request.agent(
          `http://localhost:${agent1.app.address().port}`
        );
        resolve();
      });
    });
  });

  after(() => {
    agent1.close();
    agent2.close();
    mongo.stop();
  });

  describe('GET /api/user', () => {
    it('should send unauthorized response, if the user is not authenticated', async () => {
      agent1.should.not.have.cookie('connect.sid');

      const userResponse = await agent1.get('/api/user');
      userResponse.should.have.status(401);
    });

    it('should send back user details, after successful authentication', async () => {
      const authResponse1 = await agent1.get('/auth/mock1');
      authResponse1.should.have.status(200);
      agent1.should.have.cookie('connect.sid');

      const userResponse1 = await agent1.get('/api/user');
      userResponse1.should.have.status(200);
      userResponse1.should.be.json;
      userResponse1.body.should.include.keys([
        '_id',
        'email',
        'name',
        'picture',
      ]);

      const authResponse2 = await agent2.get('/auth/mock2');
      authResponse2.should.have.status(200);
      agent2.should.have.cookie('connect.sid');

      const userResponse2 = await agent2.get('/api/user');
      userResponse2.should.have.status(200);
      userResponse2.should.be.json;
      userResponse2.body.should.include.keys([
        '_id',
        'email',
        'name',
        'picture',
      ]);

      user1 = userResponse1.body;
      user2 = userResponse2.body;

      user1._id.should.not.equal(user2._id);
    });
  });

  describe('POST /api/room/create', () => {
    it('should create a new room in database and send it in the response', async () => {
      const roomPayload = {
        name: 'room',
        privacy: 'public',
      };

      const roomResponse = await agent1
        .post('/api/room/create')
        .send(roomPayload);
      roomResponse.should.have.status(200);
      roomResponse.should.be.json;
      roomResponse.body.should.include.keys(['_id', 'users', 'lastActivity']);
      roomResponse.body.owner.should.equal(user1._id);
      roomResponse.body.name.should.equal(roomPayload.name);
      roomResponse.body.privacy.should.equal(roomPayload.privacy);

      room1 = roomResponse.body;
    });

    it('should allow to create another room with the same name', async () => {
      const roomPayload = {
        name: 'room',
        privacy: 'protected',
        password: 'password',
      };

      const roomResponse = await agent1
        .post('/api/room/create')
        .send(roomPayload);
      roomResponse.should.have.status(200);
      roomResponse.should.be.json;
      roomResponse.body.should.include.keys(['_id', 'users', 'lastActivity']);
      roomResponse.body.owner.should.equal(user1._id);
      roomResponse.body.name.should.equal(roomPayload.name);
      roomResponse.body.privacy.should.equal(roomPayload.privacy);

      room2 = roomResponse.body;
    });
  });

  describe('GET /api/room/:roomId/info', () => {
    it('should send the room info in the response, if the user is in the room', async () => {
      const roomResponse = await agent1.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.should.be.json;
      roomResponse.body._id.should.equal(room1._id);
      roomResponse.body.name.should.equal(room1.name);
      roomResponse.body.privacy.should.equal(room1.privacy);
      roomResponse.body.users.should.not.be.empty;
    });

    it('should send forbidden response, if the user is not in the room', async () => {
      const roomResponse = await agent2.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(403);
      roomResponse.should.be.json;
      roomResponse.body.room.should.not.include.key('users');
    });
  });

  describe('GET /api/room/:roomId/join', () => {
    it('should register the user in the room, if the room is public', async () => {
      const joinResponse = await agent2.post(`/api/room/${room1._id}/join`);
      joinResponse.should.have.status(200);

      const roomResponse = await agent2.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.users.length.should.equal(2);
    });

    it('should send forbidden response, if the password is wrong', async () => {
      const joinResponse = await agent2
        .post(`/api/room/${room2._id}/join`)
        .send({ password: 'badpassword' });
      joinResponse.should.have.status(403);
    });

    it('should register the user in the room, if the password is right', async () => {
      const joinResponse = await agent2
        .post(`/api/room/${room2._id}/join`)
        .send({ password: 'password' });
      joinResponse.should.have.status(200);

      const roomResponse = await agent2.get(`/api/room/${room2._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.users.length.should.equal(2);
    });
  });

  describe('POST /api/room/:roomId/update', () => {
    it('should edit the room in the database', async () => {
      const updatePayload = {
        name: 'editedroom',
      };

      const updateResponse = await agent1
        .post(`/api/room/${room1._id}/update`)
        .send(updatePayload);
      updateResponse.should.have.status(200);

      const roomResponse = await agent1.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.name.should.equal(updatePayload.name);
    });

    it('should only allow the room owner to edit the room', async () => {
      const updatePayload = {
        name: 'notownedroom',
      };

      const updateResponse = await agent2
        .post(`/api/room/${room1._id}/update`)
        .send(updatePayload);
      updateResponse.should.have.status(403);

      const roomResponse = await agent2.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.name.should.not.equal(updatePayload.name);
    });
  });

  describe('GET /api/room/:roomId/leave', () => {
    it('should remove the user from the room', async () => {
      const leaveResponse = await agent2.get(`/api/room/${room1._id}/leave`);
      leaveResponse.should.have.status(200);

      const roomResponse = await agent1.get(`/api/room/${room1._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.users.length.should.equal(1);
    });

    it('should not allow the owner to leave the room', async () => {
      const leaveResponse = await agent1.get(`/api/room/${room2._id}/leave`);
      leaveResponse.should.have.status(400);

      const roomResponse = await agent1.get(`/api/room/${room2._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.users.length.should.equal(2);
    });
  });

  describe('GET /api/room/:roomId/delete', () => {
    it('should only allow the owner to delete the room', async () => {
      const deleteResponse = await agent2.get(`/api/room/${room2._id}/delete`);
      deleteResponse.should.have.status(403);

      const roomResponse = await agent1.get(`/api/room/${room2._id}/info`);
      roomResponse.should.have.status(200);
      roomResponse.body.should.not.be.empty;
    });

    it('should delete the room from the database', async () => {
      const roomsResponse1 = await agent1.get(`/api/rooms`);
      roomsResponse1.should.have.status(200);
      roomsResponse1.body.rooms.length.should.equal(2);

      const deleteResponse = await agent1.get(`/api/room/${room2._id}/delete`);
      deleteResponse.should.have.status(200);

      const roomsResponse2 = await agent1.get(`/api/rooms`);
      roomsResponse2.should.have.status(200);
      roomsResponse2.body.rooms.length.should.equal(1);
    });
  });
});
