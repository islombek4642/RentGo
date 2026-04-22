import request from 'supertest';
import app from '../src/app.js';
import { createTestUser } from './helpers.js';
import path from 'path';
import fs from 'fs';

describe('User Verification (License Upload)', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await createTestUser();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: user.phone, password: user.plainPassword });
    token = loginRes.body.data.tokens.accessToken;
  });

  describe('POST /api/v1/users/verify', () => {
    it('should upload license image successfully', async () => {
      const filePath = path.join(process.cwd(), 'tests', 'fixtures', 'test_license.jpg');
      
      const res = await request(app)
        .post('/api/v1/users/verify')
        .set('Authorization', `Bearer ${token}`)
        .set('accept-language', 'en')
        .attach('license', filePath);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.license_image_url).toBeDefined();
      expect(res.body.data.user.is_verified).toBe(false);
      
      // Cleanup uploaded file
      const uploadedPath = path.join(process.cwd(), res.body.data.user.license_image_url);
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
    });

    it('should fail if no file is provided', async () => {
      const res = await request(app)
        .post('/api/v1/users/verify')
        .set('accept-language', 'en')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/provide a license image/i);
    });

    it('should fail for invalid file types (e.g. PDF)', async () => {
      const filePath = path.join(process.cwd(), 'tests', 'fixtures', 'test_license.pdf');
      
      const res = await request(app)
        .post('/api/v1/users/verify')
        .set('Authorization', `Bearer ${token}`)
        .set('accept-language', 'en')
        .attach('license', filePath);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Only .png, .jpg and .jpeg/i);
    });

    it('should fail if file is too large (max 5MB)', async () => {
      const filePath = path.join(process.cwd(), 'tests', 'fixtures', 'large_file.jpg');
      
      const res = await request(app)
        .post('/api/v1/users/verify')
        .set('Authorization', `Bearer ${token}`)
        .set('accept-language', 'en')
        .attach('license', filePath);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/too large/i);
    });

    it('should fail if unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/users/verify')
        .set('accept-language', 'en');

      expect(res.status).toBe(401);
    });
  });
});
