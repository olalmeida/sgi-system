import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction, TransactionWithDetails } from '../types/database';

export function useTransactions(limit = 10, autoRefresh = false) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh && user) {
      const interval = setInterval(() => {
        fetchTransactions();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh, user?.id]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          currency:currencies(code, name, symbol)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  }

  async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'created_by'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchTransactions();
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error creating transaction' 
      };
    }
  }

  async function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'created_by'>>) {
    try {
      console.log('🔄 Updating transaction:');
      console.log('  ID:', id);
      console.log('  Updates:', JSON.stringify(updates, null, 2));
      
      // Try using .match() instead of .eq()
      const { data, error, status, statusText, count } = await supabase
        .from('transactions')
        .update(updates)
        .match({ id: id })
        .select();

      console.log('📊 Update response:');
      console.log('  Status:', status);
      console.log('  Status Text:', statusText);
      console.log('  Error:', error);
      console.log('  Data:', data);
      console.log('  Count:', count);

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Update returned no data - transaction may not have been updated');
        console.warn('  This usually means RLS blocked the update or ID not found');
      } else {
        console.log('✅ Update successful! Updated data:', data[0]);
      }
      
      console.log('🔄 Refreshing list...');
      
      // Small delay to ensure database has committed the transaction
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a fresh fetch by setting loading state
      setLoading(true);
      await fetchTransactions();
      
      return { data: data?.[0] || null, error: null };
    } catch (err) {
      console.error('❌ Update failed:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error updating transaction' 
      };
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTransactions();
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Error deleting transaction' 
      };
    }
  }

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  };
}
