import { Download, PieChart } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ExportPanel } from './ExportPanel';

export function ReportsView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'analytics' | 'export'>('analytics');
  const [dateRange, setDateRange] = useState('30days');

  return (
    <div className="reports-view">
      <div
        className="view-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1>{t('reports.title')}</h1>
          <p className="stat-label">
            Analiza el rendimiento de tu negocio y descarga reportes detallados.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            className="search-input"
            style={{
              width: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 16px',
              color: 'white',
            }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">{t('reports.last7Days')}</option>
            <option value="30days">{t('reports.last30Days')}</option>
            <option value="all">{t('reports.allTime')}</option>
          </select>
        </div>
      </div>

      <div className="tabs-container" style={{ marginBottom: '2rem' }}>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <PieChart size={18} />
          {t('reports.analytics')}
        </button>
        <button
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <Download size={18} />
          {t('reports.export')}
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'analytics' ? <AnalyticsDashboard /> : <ExportPanel />}
      </div>
    </div>
  );
}
