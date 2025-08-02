-- ====================================
-- COMPLETE SUPABASE SCHEMA
-- Noble Speedy Tracking Site Database
-- ====================================
-- Run this entire script in your new Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  company TEXT,
  website TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_type_label TEXT,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  origin_postal TEXT,
  destination_postal TEXT,
  weight DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  shipment_number TEXT UNIQUE NOT NULL,
  customer TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_type_label TEXT,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  origin_postal TEXT,
  destination_postal TEXT,
  weight DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_transaction_id TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packages table (enhanced)
CREATE TABLE IF NOT EXISTS packages (
  id BIGSERIAL PRIMARY KEY,
  shipment_id BIGINT REFERENCES shipments(id) ON DELETE CASCADE,
  tracking_number TEXT UNIQUE NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  origin_zip TEXT,
  destination_zip TEXT,
  weight DECIMAL(10,2),
  recipient_name TEXT,
  recipient_address TEXT,
  contact_number TEXT,
  service_type TEXT,
  customer TEXT,
  price DECIMAL(10,2),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  current_location TEXT,
  delivery_notes TEXT,
  signature_required BOOLEAN DEFAULT FALSE,
  signature_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create package_tracking_history table
CREATE TABLE IF NOT EXISTS package_tracking_history (
  id BIGSERIAL PRIMARY KEY,
  package_id BIGINT REFERENCES packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  shipment_id BIGINT REFERENCES shipments(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_tariffs table
CREATE TABLE IF NOT EXISTS customer_tariffs (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT UNIQUE NOT NULL,
  exclusive_rate DECIMAL(10,2) NOT NULL,
  direct_rate DECIMAL(10,2) NOT NULL,
  rush_rate DECIMAL(10,2) NOT NULL,
  sameday_rate DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default customer tariffs
INSERT INTO customer_tariffs (customer_name, exclusive_rate, direct_rate, rush_rate, sameday_rate) VALUES
  ('APS', 43.5, 39.5, 29.5, 20.5),
  ('AMD', 43.5, 39.5, 29.5, 20.5),
  ('CTI', 43.5, 39.5, 29.5, 20.5),
  ('StenTech', 43.5, 39.5, 29.5, 20.5),
  ('FedEx depot / UPS', 43.5, 39.5, 29.5, 20.5),
  ('ECT', 87.5, 75.5, 53.5, 27.5),
  ('ATF', 87.5, 75.5, 53.5, 27.5),
  ('Tenstorrent', 52.5, 44.5, 29.5, 21.5),
  ('MACKIE', 160.5, 131.5, 109.5, 89.5),
  ('Bldg. A to B', 160.5, 131.5, 109.5, 89.5)
ON CONFLICT (customer_name) DO NOTHING;

-- Add foreign key columns for 1-to-1 relationships
-- 1. Each shipment has one shipping_estimate
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS shipping_estimate_id BIGINT UNIQUE;

-- 2. Each package has one package_tracking_history entry
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS package_tracking_history_id BIGINT UNIQUE;

-- 3. Each user has one customer_tariff
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS customer_tariff_id BIGINT UNIQUE;

-- 4. Each package has one payment_transaction
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS payment_transaction_id BIGINT UNIQUE;

-- Add foreign key constraints for 1-to-1 relationships
-- Note: These are added after table creation to avoid dependency issues
DO $$ 
BEGIN
  -- Add shipping_estimate foreign key to shipments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_shipments_shipping_estimate'
  ) THEN
    ALTER TABLE shipments 
    ADD CONSTRAINT fk_shipments_shipping_estimate 
      FOREIGN KEY (shipping_estimate_id) REFERENCES shipping_estimates(id) ON DELETE SET NULL;
  END IF;

  -- Add package_tracking_history foreign key to packages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_packages_tracking_history'
  ) THEN
    ALTER TABLE packages 
    ADD CONSTRAINT fk_packages_tracking_history 
      FOREIGN KEY (package_tracking_history_id) REFERENCES package_tracking_history(id) ON DELETE SET NULL;
  END IF;

  -- Add customer_tariff foreign key to users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_users_customer_tariff'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT fk_users_customer_tariff 
      FOREIGN KEY (customer_tariff_id) REFERENCES customer_tariffs(id) ON DELETE SET NULL;
  END IF;

  -- Add payment_transaction foreign key to packages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_packages_payment_transaction'
  ) THEN
    ALTER TABLE packages 
    ADD CONSTRAINT fk_packages_payment_transaction 
      FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_id ON cart(item_id);
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_shipment_number ON shipments(shipment_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_payment_status ON shipments(payment_status);
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_shipment_id ON packages(shipment_id);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON packages(tracking_number);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_package_tracking_history_package_id ON package_tracking_history(package_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_shipment_id ON payment_transactions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_shipping_estimates_created_at ON shipping_estimates(created_at);

-- Indexes for new 1-to-1 relationship foreign keys
CREATE INDEX IF NOT EXISTS idx_shipments_shipping_estimate_id ON shipments(shipping_estimate_id);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_history_id ON packages(package_tracking_history_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_tariff_id ON users(customer_tariff_id);
CREATE INDEX IF NOT EXISTS idx_packages_payment_transaction_id ON packages(payment_transaction_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_tracking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tariffs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for cart table
CREATE POLICY "Users can manage their own cart" ON cart
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::bigint)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::bigint);

-- Create RLS policies for shipments table
CREATE POLICY "Users can manage their own shipments" ON shipments
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::bigint)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::bigint);

-- Create RLS policies for packages table
CREATE POLICY "Users can view their own packages" ON packages
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::bigint);

CREATE POLICY "Admins can manage all packages" ON packages
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for package_tracking_history table
CREATE POLICY "Users can view tracking history for their packages" ON package_tracking_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_tracking_history.package_id 
      AND packages.user_id = current_setting('app.current_user_id', true)::bigint
    )
  );

CREATE POLICY "Admins can manage all tracking history" ON package_tracking_history
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for payment_transactions table
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::bigint);

CREATE POLICY "Admins can manage all payment transactions" ON payment_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for shipping_estimates table
CREATE POLICY "Allow all operations on shipping_estimates" ON shipping_estimates
  FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for customer_tariffs table
CREATE POLICY "Allow read access to customer_tariffs" ON customer_tariffs
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage customer_tariffs" ON customer_tariffs
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

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_tariffs_updated_at BEFORE UPDATE ON customer_tariffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'NST' || lpad(floor(random() * 10000000)::text, 7, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SHP' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0') || upper(substring(md5(random()::text) from 1 for 4));
END;
$$ LANGUAGE plpgsql; 

-- Create admin user if it doesn't exist
INSERT INTO users (
  username, 
  email, 
  password, 
  email_verified, 
  phone, 
  state_province, 
  postal_code, 
  role
) VALUES (
  'admin',
  'admin@noblespeedytrac.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
  true,
  '+1-555-123-4567',
  'Ontario',
  'M5V 3A8',
  'admin'
) ON CONFLICT (username) DO UPDATE SET role = 'admin'; 

-- Verify admin user creation
SELECT id, username, email, role, email_verified 
FROM users 
WHERE username = 'admin' OR email = 'admin@noblespeedytrac.com';