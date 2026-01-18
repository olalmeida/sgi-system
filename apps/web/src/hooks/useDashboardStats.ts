import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalLiquidity: number;
  budgetExecuted: number;
  activeProcesses: number;
  pendingProcesses: number;
  loading: boolean;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLiquidity: 0,
    budgetExecuted: 0,
    activeProcesses: 0,
    pendingProcesses: 0,
    loading: true,
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user?.id]);

  async function fetchStats() {
    try {
      // Fetch total liquidity from transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, currency_code');

      // Fetch budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('total_amount, spent_amount');

      // Fetch logistics processes
      const { data: processes } = await supabase
        .from('logistics_processes')
        .select('status');

      // Calculate total liquidity (simplified - all in USD for now)
      let totalLiquidity = 0;
      if (transactions) {
        transactions.forEach(t => {
          if (t.type === 'income') {
            totalLiquidity += t.amount;
          } else {
            totalLiquidity -= t.amount;
          }
        });
      }

      // Calculate budget execution percentage
      let totalBudget = 0;
      let totalSpent = 0;
      if (budgets) {
        budgets.forEach(b => {
          totalBudget += b.total_amount;
          totalSpent += b.spent_amount;
        });
      }
      const budgetExecuted = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      // Count active and pending processes
      const activeProcesses = processes?.filter(p => 
        p.status === 'in_progress' || p.status === 'pending'
      ).length || 0;
      
      const pendingProcesses = processes?.filter(p => 
        p.status === 'pending'
      ).length || 0;

      setStats({
        totalLiquidity,
        budgetExecuted,
        activeProcesses,
        pendingProcesses,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  return { ...stats, refresh: fetchStats };
}
