-- ============================================================
-- GESTIO SYSTEM: SETUP SCHEMA (Simplified - No Roles)
-- ============================================================

-- 1. CLEANUP (Optional - use only if you want to reset everything)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. ENUMS
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE process_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- 3. TABLES

-- Profiles: Link to Auth users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Currencies: Supported currencies
CREATE TABLE public.currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text,
  rate_to_usd numeric DEFAULT 1.0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Budgets
CREATE TABLE public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  currency_code text REFERENCES public.currencies(code) DEFAULT 'USD',
  start_date date,
  end_date date,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric NOT NULL,
  currency_code text REFERENCES public.currencies(code) DEFAULT 'USD',
  type transaction_type NOT NULL,
  description text,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Logistics Processes
CREATE TABLE public.logistics_processes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  status process_status DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  details jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_processes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Currencies Policies
CREATE POLICY "Currencies are viewable by everyone" ON public.currencies
  FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage currencies" ON public.currencies
  FOR ALL USING (auth.role() = 'authenticated');

-- Budgets Policies (User Ownership)
CREATE POLICY "Users can manage their own budgets" ON public.budgets
  FOR ALL USING (auth.uid() = created_by);

-- Transactions Policies (User Ownership)
CREATE POLICY "Users can manage their own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = created_by);

-- Logistics Processes Policies (User Ownership or Assigned)
CREATE POLICY "Users can manage their own or assigned processes" ON public.logistics_processes
  FOR ALL USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- 5. TRIGGERS & FUNCTIONS

-- Handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_logistics_updated
  BEFORE UPDATE ON public.logistics_processes
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatically update budget spent_amount
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
DECLARE
  budget_id_to_update UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    budget_id_to_update := OLD.budget_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.budget_id IS DISTINCT FROM NEW.budget_id THEN
      IF OLD.budget_id IS NOT NULL THEN
        UPDATE budgets SET spent_amount = (
          SELECT COALESCE(SUM(amount), 0) FROM transactions 
          WHERE budget_id = OLD.budget_id AND type = 'expense'
        ) WHERE id = OLD.budget_id;
      END IF;
      budget_id_to_update := NEW.budget_id;
    ELSE
      budget_id_to_update := NEW.budget_id;
    END IF;
  ELSE
    budget_id_to_update := NEW.budget_id;
  END IF;

  IF budget_id_to_update IS NOT NULL THEN
    UPDATE budgets SET spent_amount = (
      SELECT COALESCE(SUM(amount), 0) FROM transactions 
      WHERE budget_id = budget_id_to_update AND type = 'expense'
    ) WHERE id = budget_id_to_update;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_spent
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_spent_amount();

-- 6. INITIAL DATA
INSERT INTO public.currencies (code, name, symbol, rate_to_usd) VALUES
('USD', 'US Dollar', '$', 1.0),
('EUR', 'Euro', '€', 0.92),
('BRL', 'Brazilian Real', 'R$', 5.0),
('ARS', 'Argentine Peso', '$', 800.0)
ON CONFLICT (code) DO NOTHING;
