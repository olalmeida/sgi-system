import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Budget, BudgetWithCurrency } from '../types/database';

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetWithCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  async function fetchBudgets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          currency:currencies(code, name, symbol)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching budgets');
    } finally {
      setLoading(false);
    }
  }

  async function createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'spent_amount' | 'created_by'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, created_by: user?.id, spent_amount: 0 }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error creating budget' 
      };
    }
  }

  async function updateBudget(id: string, updates: Partial<Budget>) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error updating budget' 
      };
    }
  }

  async function deleteBudget(id: string) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchBudgets();
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Error deleting budget' 
      };
    }
  }

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refresh: fetchBudgets,
  };
}
