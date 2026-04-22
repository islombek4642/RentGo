import request from 'supertest';
import app from '../src/app.js';
import { createTestUser, createTestCar, createTestBooking } from './helpers.js';

describe('Bookings Module', () => {
  let token;
  let user;
  let car;

  beforeEach(async () => {
    user = await createTestUser();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ phone: user.phone, password: user.plainPassword });
    token = loginRes.body.data.tokens.accessToken;
    
    // Create an owner for the car
    const owner = await createTestUser({ phone: '+998901111111' });
    car = await createTestCar(owner.id);
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        car_id: car.id,
        start_date: '2026-12-01',
        end_date: '2026-12-05'
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.booking.car_id).toBe(car.id);
    });

    it('should fail if dates overlap with an existing booking', async () => {
      // Create existing booking: Dec 10 to Dec 15
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-10',
        end_date: '2026-12-15'
      });

      // Try to book overlapping: Dec 12 to Dec 17
      const overlappingData = {
        car_id: car.id,
        start_date: '2026-12-12',
        end_date: '2026-12-17'
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(overlappingData);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should fail if car is not available', async () => {
       // Set car availability to false
       const owner = await createTestUser({ phone: '+998902222222' });
       const unavailableCar = await createTestCar(owner.id, { is_available: false });

       const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: unavailableCar.id,
          start_date: '2026-11-01',
          end_date: '2026-11-05'
        });

      expect(res.status).toBe(400);
    });

    // ================================================================
    // NEW: Half-open interval [start, end) edge case tests
    // ================================================================

    it('should allow back-to-back bookings (end_date === start_date of next)', async () => {
      // Booking A: [Apr 21, Apr 23)
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-21',
        end_date: '2026-12-23',
        status: 'confirmed'
      });

      // Booking B: [Apr 23, Apr 25) — should NOT overlap
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-23',
          end_date: '2026-12-25'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should allow booking when end_date of existing equals start_date of new (boundary equality)', async () => {
      // Existing: [Dec 1, Dec 5)
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-01',
        end_date: '2026-12-05',
        status: 'confirmed'
      });

      // New: starts exactly on Dec 5 (checkout day of existing)
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-05',
          end_date: '2026-12-08'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should reject zero-day booking (start_date === end_date)', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-10',
          end_date: '2026-12-10'
        });

      expect(res.status).toBe(400);
    });

    it('should reject booking where end_date < start_date', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-10',
          end_date: '2026-12-08'
        });

      expect(res.status).toBe(400);
    });

    it('should create a valid 1-day booking (end = start + 1)', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-10',
          end_date: '2026-12-11'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.booking).toBeDefined();
      // Price should be 1 day × price_per_day
      expect(parseFloat(res.body.data.booking.total_price)).toBe(parseFloat(car.price_per_day));
    });

    it('should correctly calculate price for multi-day booking (half-open)', async () => {
      // [Dec 1, Dec 5) = 4 days
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-01',
          end_date: '2026-12-05'
        });

      expect(res.status).toBe(201);
      const expectedPrice = 4 * parseFloat(car.price_per_day);
      expect(parseFloat(res.body.data.booking.total_price)).toBe(expectedPrice);
    });

    it('should block truly overlapping ranges', async () => {
      // Existing: [Dec 10, Dec 15)
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-10',
        end_date: '2026-12-15',
        status: 'confirmed'
      });

      // New: [Dec 8, Dec 12) — overlaps with existing
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-08',
          end_date: '2026-12-12'
        });

      expect(res.status).toBe(400);
      expect(res.body.details?.code).toBe('BOOKING_CONFLICT');
    });

    it('should allow booking with 1-day gap between existing bookings', async () => {
      // Existing: [Dec 10, Dec 13) — occupies Dec 10, 11, 12
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-10',
        end_date: '2026-12-13',
        status: 'confirmed'
      });

      // New: [Dec 14, Dec 16) — gap on Dec 13 (checkout day)
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-14',
          end_date: '2026-12-16'
        });

      expect(res.status).toBe(201);
    });

    it('should return BOOKING_CONFLICT with nextAvailableDate on overlap', async () => {
      // Existing: [Dec 10, Dec 15)
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-10',
        end_date: '2026-12-15',
        status: 'confirmed'
      });

      // Try overlapping: [Dec 12, Dec 17)
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          car_id: car.id,
          start_date: '2026-12-12',
          end_date: '2026-12-17'
        });

      expect(res.status).toBe(400);
      expect(res.body.details?.code).toBe('BOOKING_CONFLICT');
      expect(res.body.details?.conflictRange).toBeDefined();
      expect(res.body.details?.nextAvailableDate).toBeDefined();
    });
  });

  describe('GET /api/v1/bookings/my', () => {
    it('should list user bookings', async () => {
      await createTestBooking(car.id, user.id);

      const res = await request(app)
        .get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings).toBeInstanceOf(Array);
      expect(res.body.results).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/bookings/car/:carId', () => {
    it('should return booked dates for a car', async () => {
      await createTestBooking(car.id, user.id, {
        start_date: '2026-12-01',
        end_date: '2026-12-05',
        status: 'confirmed'
      });

      const res = await request(app)
        .get(`/api/v1/bookings/car/${car.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.dates).toBeInstanceOf(Array);
      expect(res.body.data.dates.length).toBeGreaterThan(0);
      expect(res.body.data.dates[0]).toHaveProperty('start_date');
      expect(res.body.data.dates[0]).toHaveProperty('end_date');
      expect(res.body.data.dates[0]).toHaveProperty('status');
    });
  });
});
