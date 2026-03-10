/*
  # Create AI Agency SaaS Platform Schema

  ## Overview
  This migration creates the complete database schema for a white-label AI agency platform.
  
  ## Tables Created
  
  ### 1. resellers
  - Stores agency owner profiles
  - Links to auth.users via user_id
  - Contains branding info (logo, colors)
  - Tracks subscription plan
  
  ### 2. clients
  - Stores client businesses managed by resellers
  - Each client belongs to one reseller
  - Contains business details and contact info
  
  ### 3. contacts
  - Customer contacts for review campaigns
  - Each contact belongs to a client
  - Tracks review request and completion status
  
  ### 4. review_campaigns
  - Review automation campaigns for clients
  - Contains message templates with variables
  - Tracks campaign performance metrics
  
  ### 5. chatbot_configs
  - AI chatbot configurations per client
  - Contains welcome messages and business context
  - Customizable by industry template
  
  ## Security
  - RLS enabled on all tables
  - Resellers can only access their own data
  - Cascading relationships maintain data integrity
  
  ## Triggers
  - Auto-create reseller profile on user signup
*/

-- Create resellers table
CREATE TABLE IF NOT EXISTS resellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  agency_name text NOT NULL,
  agency_logo_url text,
  primary_color text DEFAULT '#2563eb',
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'scale')),
  created_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_type text NOT NULL,
  phone text,
  email text,
  website text,
  address text,
  city text,
  state text,
  google_review_link text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  review_requested boolean DEFAULT false,
  review_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create review_campaigns table
CREATE TABLE IF NOT EXISTS review_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  campaign_name text NOT NULL,
  message_template text NOT NULL,
  follow_up_template text,
  follow_up_days integer DEFAULT 3,
  is_active boolean DEFAULT true,
  total_sent integer DEFAULT 0,
  total_clicked integer DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create chatbot_configs table
CREATE TABLE IF NOT EXISTS chatbot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_active boolean DEFAULT false,
  welcome_message text DEFAULT 'Hi! How can I help you today?',
  business_context text,
  industry_template text,
  primary_color text DEFAULT '#2563eb',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resellers table
CREATE POLICY "Users can view own reseller profile"
  ON resellers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reseller profile"
  ON resellers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reseller profile"
  ON resellers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for clients table
CREATE POLICY "Resellers can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    reseller_id IN (
      SELECT id FROM resellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    reseller_id IN (
      SELECT id FROM resellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    reseller_id IN (
      SELECT id FROM resellers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    reseller_id IN (
      SELECT id FROM resellers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    reseller_id IN (
      SELECT id FROM resellers WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for contacts table
CREATE POLICY "Resellers can view contacts of own clients"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can insert contacts for own clients"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can update contacts of own clients"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can delete contacts of own clients"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- RLS Policies for review_campaigns table
CREATE POLICY "Resellers can view campaigns of own clients"
  ON review_campaigns FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can insert campaigns for own clients"
  ON review_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can update campaigns of own clients"
  ON review_campaigns FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can delete campaigns of own clients"
  ON review_campaigns FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- RLS Policies for chatbot_configs table
CREATE POLICY "Resellers can view chatbot configs of own clients"
  ON chatbot_configs FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can insert chatbot configs for own clients"
  ON chatbot_configs FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can update chatbot configs of own clients"
  ON chatbot_configs FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Resellers can delete chatbot configs of own clients"
  ON chatbot_configs FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c
      INNER JOIN resellers r ON c.reseller_id = r.id
      WHERE r.user_id = auth.uid()
    )
  );

-- Function to auto-create reseller profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.resellers (user_id, agency_name)
  VALUES (new.id, 'My Agency');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create reseller profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();