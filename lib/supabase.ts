import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Reseller = {
  id: string;
  user_id: string;
  agency_name: string;
  agency_logo_url: string | null;
  primary_color: string;
  plan: 'free' | 'starter' | 'growth' | 'scale';
  created_at: string;
};

export type Client = {
  id: string;
  reseller_id: string;
  business_name: string;
  business_type: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  google_review_link: string | null;
  is_active: boolean;
  created_at: string;
};

export type Contact = {
  id: string;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  review_requested: boolean;
  review_completed: boolean;
  created_at: string;
};

export type ReviewCampaign = {
  id: string;
  client_id: string;
  campaign_name: string;
  message_template: string;
  follow_up_template: string | null;
  follow_up_days: number;
  is_active: boolean;
  total_sent: number;
  total_clicked: number;
  total_reviews: number;
  created_at: string;
};

export type ChatbotConfig = {
  id: string;
  client_id: string;
  is_active: boolean;
  welcome_message: string;
  business_context: string | null;
  industry_template: string | null;
  primary_color: string;
  created_at: string;
};
