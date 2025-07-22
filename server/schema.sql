-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  phone TEXT,
  state_province TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id BIGSERIAL PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  origin_zip TEXT,
  destination_zip TEXT,
  weight DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping_estimates table
CREATE TABLE IF NOT EXISTS shipping_estimates (
  id BIGSERIAL PRIMARY KEY,
  origin_zip TEXT NOT NULL,
  destination_zip TEXT NOT NULL,
  weight DECIMAL(10,2) NOT NULL,
  service_type TEXT NOT NULL,
  estimated_cost DECIMAL(10,2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON packages(tracking_number);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_shipping_estimates_created_at ON shipping_estimates(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_estimates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table (allow all operations for now)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for packages table (allow all operations for now)
CREATE POLICY "Allow all operations on packages" ON packages
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for shipping_estimates table (allow all operations for now)
CREATE POLICY "Allow all operations on shipping_estimates" ON shipping_estimates
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 