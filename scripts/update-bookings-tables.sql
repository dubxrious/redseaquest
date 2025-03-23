-- Add user_id to bookings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_id INTEGER REFERENCES users(id);
  END IF;
END $$;

-- Create booking_travelers table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_travelers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(255),
  is_lead BOOLEAN NOT NULL DEFAULT false,
  traveler_type VARCHAR(50) NOT NULL DEFAULT 'adult',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on booking_id for faster lookups
CREATE INDEX IF NOT EXISTS booking_travelers_booking_id_idx ON booking_travelers(booking_id);

