import pool from './src/config/db.js';

async function migrate() {
  try {
    console.log('Starting Trust System migration (Refined)...');
    
    // 1. Alter Users table
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS license_image_url TEXT');
    console.log('Users table updated.');

    // 2. Create Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
          reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT one_review_per_booking UNIQUE(booking_id, reviewer_id)
      )
    `);
    console.log('Reviews table created.');

    // 3. Create Indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON reviews(car_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id)');
    console.log('Indexes created.');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
