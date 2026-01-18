// Database types matching our Supabase schema

export type TransactionType = 'income' | 'expense';
export type ProcessStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string | null;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string | null;
  rate_to_usd: number;
  updated_at: string;
}

export interface Budget {
  id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
  currency_code: string;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency_code: string;
  type: TransactionType;
  description: string | null;
  budget_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LogisticsProcess {
  id: string;
  name: string;
  status: ProcessStatus;
  assigned_to: string | null;
  created_by: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface TransactionWithDetails extends Transaction {
  currency?: Currency;
  budget?: Budget;
  creator?: Profile;
}

export interface BudgetWithCurrency extends Budget {
  currency?: Currency;
}

export interface LogisticsProcessWithAssignee extends LogisticsProcess {
  assignee?: Profile;
}
