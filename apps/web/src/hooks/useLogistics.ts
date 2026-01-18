import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LogisticsProcess } from '../types/database';

export function useLogistics() {
  const [processes, setProcesses] = useState<LogisticsProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProcesses();
    }
  }, [user?.id]);

  async function fetchProcesses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_processes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProcesses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching logistics processes');
    } finally {
      setLoading(false);
    }
  }

  async function createProcess(process: Omit<LogisticsProcess, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('logistics_processes')
        .insert([{ ...process, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProcesses();
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error creating process' 
      };
    }
  }

  async function updateProcess(id: string, updates: Partial<LogisticsProcess>) {
    try {
      const { data, error } = await supabase
        .from('logistics_processes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchProcesses();
      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Error updating process' 
      };
    }
  }

  async function deleteProcess(id: string) {
    try {
      const { error } = await supabase
        .from('logistics_processes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProcesses();
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Error deleting process' 
      };
    }
  }

  return {
    processes,
    loading,
    error,
    createProcess,
    updateProcess,
    deleteProcess,
    refresh: fetchProcesses,
  };
}
