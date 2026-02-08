import { Plus, Trash2, Wallet, Edit, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../../hooks/useTransactions';
import type { TransactionWithDetails } from '../../types/database';
import { TransactionForm } from './TransactionForm';

export function FinanceView() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null);
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } =
    useTransactions(50);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (confirm(t('finance.deleteConfirm'))) {
      const result = await deleteTransaction(id);
      if (result.error) {
        toast.error(t('finance.deleteError'));
      } else {
        toast.success(t('finance.deleted'));
      }
    }
  };

  const handleEdit = (transaction: TransactionWithDetails) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm || transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCurrency =
      filterCurrency === 'all' || transaction.currency_code === filterCurrency;

    return matchesSearch && matchesType && matchesCurrency;
  });

  // Get unique currencies
  const currencies = Array.from(new Set(transactions.map((t) => t.currency_code)));

  return (
    <div className="finance-view">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1>{t('finance.title')}</h1>
        <button className="action-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> {t('finance.newTransaction')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-container" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-group">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('finance.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            className="filter-select"
          >
            <option value="all">{t('finance.allTypes')}</option>
            <option value="income">{t('finance.incomes')}</option>
            <option value="expense">{t('finance.expenses')}</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('finance.allCurrencies')}</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        {(searchTerm || filterType !== 'all' || filterCurrency !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCurrency('all');
            }}
            className="action-button"
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          >
            {t('finance.clearFilters')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <p className="stat-label">{t('common.loading')}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <Wallet size={64} className="empty-state-icon" />
          <h3>{t('finance.noResults')}</h3>
          <p className="stat-label">{t('finance.adjustFilters')}</p>
          {!searchTerm && filterType === 'all' && filterCurrency === 'all' && (
            <button
              className="auth-button"
              style={{ marginTop: '1rem' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} /> {t('finance.newTransaction')}
            </button>
          )}
        </div>
      ) : (
        <div className="data-table-container">
          <table>
            <thead>
              <tr>
                <th>{t('finance.date')}</th>
                <th>{t('finance.description')}</th>
                <th>{t('finance.type')}</th>
                <th>{t('finance.amount')}</th>
                <th>{t('finance.currency')}</th>
                <th>{t('finance.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {new Date(transaction.created_at).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{transaction.description || t('dashboard.noDescription')}</td>
                  <td>
                    <span
                      className={`status-badge ${transaction.type === 'income' ? 'status-completed' : 'status-pending'}`}
                    >
                      {transaction.type === 'income' ? t('finance.income') : t('finance.expense')}
                    </span>
                  </td>
                  <td
                    style={{
                      color: transaction.type === 'income' ? 'var(--secondary)' : '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{transaction.currency?.symbol || transaction.currency_code}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="action-button"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="action-button danger"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TransactionForm
          onSubmit={createTransaction}
          onUpdate={updateTransaction}
          onClose={handleCloseForm}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}
