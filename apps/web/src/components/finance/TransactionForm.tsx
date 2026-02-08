import { Plus, X, Save } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useBudgets } from '../../hooks/useBudgets';
import type { Transaction, TransactionWithDetails } from '../../types/database';

interface TransactionFormProps {
  onSubmit: (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'created_by'>
  ) => Promise<{ error: string | null }>;
  onUpdate?: (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'created_at' | 'created_by'>>
  ) => Promise<{ error: string | null }>;
  onClose: () => void;
  transaction?: TransactionWithDetails | null;
}

export function TransactionForm({
  onSubmit,
  onUpdate,
  onClose,
  transaction,
}: TransactionFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const { budgets } = useBudgets();
  const [formData, setFormData] = useState({
    amount: '',
    currency_code: 'USD',
    type: 'expense' as 'income' | 'expense',
    description: '',
    budget_id: null as string | null,
  });

  const isEditMode = !!transaction;

  // Populate form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        currency_code: transaction.currency_code,
        type: transaction.type,
        description: transaction.description || '',
        budget_id: transaction.budget_id,
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        currency_code: formData.currency_code,
        type: formData.type,
        description: formData.description || null,
        budget_id: formData.budget_id,
      };

      if (isEditMode && onUpdate && transaction) {
        const { error } = await onUpdate(transaction.id, transactionData);
        if (error) {
          setError(error);
          toast.error(t('finance.updateError'));
        } else {
          toast.success(t('finance.updated'));
          onClose();
        }
      } else {
        const { error } = await onSubmit(transactionData);
        if (error) {
          setError(error);
          toast.error(t('finance.createError'));
        } else {
          toast.success(t('finance.created'));
          onClose();
        }
      }
    } catch {
      setError(isEditMode ? t('finance.updateError') : t('finance.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      currency_code: 'USD',
      type: 'expense' as 'income' | 'expense',
      description: '',
      budget_id: null as string | null,
    });
    setError('');
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      role="button"
      tabIndex={-1}
      aria-label={t('common.close')}
    >
      <div className="modal-content" ref={contentRef} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{isEditMode ? t('finance.editTransaction') : t('finance.newTransaction')}</h2>
          <button onClick={handleClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('finance.type')}</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })
              }
              required
            >
              <option value="expense">{t('finance.expense')}</option>
              <option value="income">{t('finance.income')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('finance.amount')}</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>{t('finance.currency')}</label>
            <select
              value={formData.currency_code}
              onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
              required
            >
              <option value="USD">{t('common.currencies.USD')}</option>
              <option value="EUR">{t('common.currencies.EUR')}</option>
              <option value="BRL">{t('common.currencies.BRL')}</option>
              <option value="ARS">{t('common.currencies.ARS')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {t('finance.budget')} {t('budgets.optional')}
            </label>
            <select
              value={formData.budget_id || ''}
              onChange={(e) => setFormData({ ...formData, budget_id: e.target.value || null })}
            >
              <option value="">{t('finance.noBudget')}</option>
              {budgets
                .filter((budget) => budget.currency_code === formData.currency_code)
                .map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} ({budget.currency?.symbol || budget.currency_code}
                    {budget.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </option>
                ))}
            </select>
            {budgets.filter((b) => b.currency_code === formData.currency_code).length === 0 &&
              budgets.length > 0 && (
                <small
                  className="stat-label"
                  style={{ color: '#f59e0b', marginTop: '0.5rem', display: 'block' }}
                >
                  ⚠️ {t('finance.noBudgetsInCurrency', { currency: formData.currency_code })}
                </small>
              )}
          </div>

          <div className="form-group">
            <label>{t('finance.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('finance.searchPlaceholder')}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <div className="auth-message error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              isEditMode ? (
                t('common.loading')
              ) : (
                t('common.loading')
              )
            ) : (
              <>
                {isEditMode ? <Save size={18} /> : <Plus size={18} />}
                {isEditMode ? ` ${t('common.save')}` : ` ${t('finance.newTransaction')}`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
