-- Add status to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing cars to approved (so we don't break current data)
UPDATE cars SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Add index for admin filtering
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
