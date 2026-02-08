import { Plus, Edit, Trash2, Wallet, TrendingUp, Filter } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useBudgets } from '../../hooks/useBudgets';
import type { BudgetWithCurrency } from '../../types/database';
import { BudgetForm } from './BudgetForm';

export function BudgetView() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCurrency | null>(null);
  const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets();

  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'exceeded' | 'completed'>(
    'all'
  );
  const [filterCurrency, setFilterCurrency] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (confirm(t('budgets.deleteConfirm'))) {
      const result = await deleteBudget(id);
      if (result.error) {
        toast.error(t('budgets.deleteError'));
      } else {
        toast.success(t('budgets.deleted'));
      }
    }
  };

  const handleEdit = (budget: BudgetWithCurrency) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444'; // Red
    if (percentage >= 75) return '#f59e0b'; // Orange
    return 'var(--secondary)'; // Green
  };

  // Filter budgets
  const filteredBudgets = budgets.filter((budget) => {
    const percentage =
      budget.total_amount > 0 ? (budget.spent_amount / budget.total_amount) * 100 : 0;
    const isExceeded = budget.spent_amount > budget.total_amount;
    const isCompleted = percentage >= 100 && !isExceeded;
    const isActive = percentage < 100 && !isExceeded;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'exceeded' && isExceeded) ||
      (filterStatus === 'completed' && isCompleted);

    const matchesCurrency = filterCurrency === 'all' || budget.currency_code === filterCurrency;

    return matchesStatus && matchesCurrency;
  });

  // Get unique currencies
  const currencies = Array.from(new Set(budgets.map((b) => b.currency_code)));

  return (
    <div className="budget-view">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1>{t('budgets.title')}</h1>
        <button className="action-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> {t('budgets.newBudget')}
        </button>
      </div>

      {/* Filters */}
      {budgets.length > 0 && (
        <div className="filters-container" style={{ marginBottom: '1.5rem' }}>
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | 'active' | 'exceeded' | 'completed')
              }
              className="filter-select"
            >
              <option value="all">{t('common.allStatus')}</option>
              <option value="active">{t('budgets.activeStatus')}</option>
              <option value="exceeded">{t('budgets.exceededStatus')}</option>
              <option value="completed">{t('budgets.completedStatus')}</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t('common.allCurrencies')}</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          {(filterStatus !== 'all' || filterCurrency !== 'all') && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterCurrency('all');
              }}
              className="action-button"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              {t('common.clearFilters')}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p className="stat-label">{t('common.loading')}</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="empty-state">
          <Wallet size={64} className="empty-state-icon" />
          <h3>{t('budgets.noResults')}</h3>
          <p className="stat-label">
            {filterStatus !== 'all' || filterCurrency !== 'all'
              ? t('finance.adjustFilters')
              : t('budgets.createFirst')}
          </p>
          {filterStatus === 'all' && filterCurrency === 'all' && (
            <button
              className="auth-button"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} /> {t('budgets.newBudget')}
            </button>
          )}
        </div>
      ) : (
        <div className="budget-grid">
          {filteredBudgets.map((budget) => {
            const percentage =
              budget.total_amount > 0 ? (budget.spent_amount / budget.total_amount) * 100 : 0;
            const remaining = budget.total_amount - budget.spent_amount;

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <div>
                    <h3>{budget.name}</h3>
                    <p className="stat-label">
                      {budget.start_date && budget.end_date && (
                        <>
                          {new Date(budget.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' - '}
                          {new Date(budget.end_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="action-button"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="action-button danger"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="budget-amount-item">
                    <span className="stat-label">{t('budgets.spent')}</span>
                    <span className="stat-value" style={{ fontSize: '1.25rem' }}>
                      {budget.currency?.symbol || budget.currency_code}
                      {budget.spent_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="budget-amount-item">
                    <span className="stat-label">{t('common.total')}</span>
                    <span className="stat-value" style={{ fontSize: '1.25rem' }}>
                      {budget.currency?.symbol || budget.currency_code}
                      {budget.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: getProgressColor(percentage),
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                    }}
                  >
                    <span className="stat-label">
                      {percentage.toFixed(1)}% {t('budgets.spent')}
                    </span>
                    <span
                      className="stat-label"
                      style={{ color: remaining >= 0 ? 'var(--secondary)' : '#ef4444' }}
                    >
                      {remaining >= 0 ? (
                        <>
                          <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {budget.currency?.symbol || budget.currency_code}
                          {remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                          {t('budgets.available')}
                        </>
                      ) : (
                        <>
                          ⚠️ {t('budgets.exceeded')}{' '}
                          {budget.currency?.symbol || budget.currency_code}
                          {Math.abs(remaining).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <BudgetForm
          onSubmit={createBudget}
          onUpdate={updateBudget}
          onClose={handleCloseForm}
          budget={editingBudget}
        />
      )}
    </div>
  );
}
