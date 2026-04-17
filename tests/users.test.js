import request from 'supertest';
import app from '../src/app.js';
import { createTestUser } from './helpers.js';

describe('Users Module', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await createTestUser();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: user.phone, password: user.plainPassword });
    token = loginRes.body.data.tokens.accessToken;
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.id).toBe(user.id);
    });

    it('should fail if no token is provided', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile successfully', async () => {
      const updateData = { name: 'Updated Name' };

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe(updateData.name);
    });
  });
});
