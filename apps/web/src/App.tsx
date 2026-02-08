import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Truck,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  LogOut,
  BarChart,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './index.css';
import { AuthPage } from './components/auth/AuthPage';
// import { useBudgets } from './hooks/useBudgets';
// import { useLogistics } from './hooks/useLogistics';
import { BudgetView } from './components/budgets/BudgetView';
import { FinanceView } from './components/finance/FinanceView';
import { LogisticsView } from './components/logistics/LogisticsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { useAuth } from './hooks/useAuth';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useTransactions } from './hooks/useTransactions';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const { transactions, loading: transactionsLoading } = useTransactions(5);
  const dashboardStats = useDashboardStats();

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const interval = setInterval(() => {
        window.location.reload();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthPage />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">Gestio System</div>

          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>{t('nav.dashboard')}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`}
              onClick={() => setActiveTab('finance')}
            >
              <Wallet size={20} />
              <span>{t('nav.finance')}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'budgets' ? 'active' : ''}`}
              onClick={() => setActiveTab('budgets')}
            >
              <BarChart3 size={20} />
              <span>{t('nav.budgets')}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'logistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('logistics')}
            >
              <Truck size={20} />
              <span>{t('nav.logistics')}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart size={20} />
              <span>{t('nav.reports')}</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>{t('nav.settings')}</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-button" onClick={signOut}>
              <LogOut size={18} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header className="main-header">
            <div className="user-profile">
              <div className="avatar">{user?.email?.substring(0, 2).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <div className="user-name-text">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('common.user')}
                </div>
                <div className="user-email-text">{user?.email || ''}</div>
              </div>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h1 style={{ marginBottom: '2rem' }}>{t('dashboard.overview')}</h1>

              <div className="dashboard-grid">
                <div className="stat-card">
                  <div className="stat-label">{t('dashboard.totalLiquidity')}</div>
                  <div className="stat-value">
                    {dashboardStats.loading
                      ? '...'
                      : `$${dashboardStats.totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <div className="stat-trend trend-up">
                    <TrendingUp size={16} /> {t('dashboard.realTime')}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('dashboard.budgetExecuted')}</div>
                  <div className="stat-value">
                    {dashboardStats.loading
                      ? '...'
                      : `${dashboardStats.budgetExecuted.toFixed(1)}%`}
                  </div>
                  <div
                    className="stat-trend"
                    style={{
                      color: dashboardStats.budgetExecuted > 80 ? '#ef4444' : 'var(--secondary)',
                    }}
                  >
                    {dashboardStats.budgetExecuted > 80 ? (
                      <TrendingDown size={16} />
                    ) : (
                      <TrendingUp size={16} />
                    )}
                    {dashboardStats.budgetExecuted > 80
                      ? ` ${t('dashboard.attentionRequired')}`
                      : ` ${t('dashboard.withinRange')}`}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">{t('dashboard.logisticsProcesses')}</div>
                  <div className="stat-value">
                    {dashboardStats.loading
                      ? '...'
                      : `${dashboardStats.activeProcesses} ${t('dashboard.activeCount')}`}
                  </div>
                  <div className="stat-trend" style={{ color: 'var(--primary)' }}>
                    <Clock size={16} /> {dashboardStats.pendingProcesses}{' '}
                    {t('dashboard.pendingCount')}
                  </div>
                </div>
              </div>

              <div className="data-table-container">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                  }}
                >
                  <h3>{t('dashboard.recentTransactions')}</h3>
                  <button
                    className="nav-item active"
                    style={{ border: 'none', padding: '8px 16px' }}
                    onClick={() => setActiveTab('finance')}
                  >
                    {t('dashboard.viewAll')}
                  </button>
                </div>

                {transactionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p className="stat-label">{t('common.loading')}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p className="stat-label">{t('dashboard.noTransactions')}</p>
                    <button
                      className="auth-button"
                      style={{ marginTop: '1rem', maxWidth: '200px', margin: '1rem auto' }}
                      onClick={() => setActiveTab('finance')}
                    >
                      {t('finance.newTransaction')}
                    </button>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>{t('finance.description')}</th>
                        <th>{t('finance.amount')}</th>
                        <th>{t('finance.currency')}</th>
                        <th>{t('finance.type')}</th>
                        <th>{t('finance.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.description || t('dashboard.noDescription')}</td>
                          <td
                            style={{
                              color: transaction.type === 'income' ? 'var(--secondary)' : '#ef4444',
                            }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {transaction.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td>{transaction.currency?.symbol || transaction.currency_code}</td>
                          <td>
                            <span
                              className={`status-badge ${transaction.type === 'income' ? 'status-completed' : 'status-pending'}`}
                            >
                              {transaction.type === 'income'
                                ? t('finance.income')
                                : t('finance.expense')}
                            </span>
                          </td>
                          <td>
                            {new Date(transaction.created_at).toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'finance' && <FinanceView />}
          {activeTab === 'budgets' && <BudgetView />}
          {activeTab === 'logistics' && <LogisticsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </>
  );
}

export default App;
