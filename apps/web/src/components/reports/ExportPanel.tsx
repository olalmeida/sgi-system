import { FileText, Table as TableIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBudgets } from '../../hooks/useBudgets';
import { useLogistics } from '../../hooks/useLogistics';
import { useTransactions } from '../../hooks/useTransactions';
import { exportToPDF, exportToExcel } from '../../services/exportService';

export function ExportPanel() {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState<string | null>(null);

  const { transactions } = useTransactions(1000);
  const { budgets } = useBudgets();
  const { processes } = useLogistics();

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      await exportToPDF({
        transactions,
        budgets,
        title: t('reports.financialSummary'),
        t,
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      await exportToExcel({
        transactions,
        budgets,
        processes,
        filename: `Gestio_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
        t,
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="export-panel">
      <div
        className="stat-card"
        style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
      >
        <p className="stat-label" style={{ marginBottom: '2rem' }}>
          Descarga la información de tu sistema en formatos compatibles para contabilidad y
          auditoría.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}
        >
          <button
            className="option-card"
            onClick={handleExportPDF}
            disabled={!!exporting}
            style={{ border: 'none', textAlign: 'center', width: '100%' }}
          >
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <FileText size={40} style={{ color: '#ef4444' }} />
            </div>
            <h4>{t('reports.downloadPdf')}</h4>
            <p className="stat-label" style={{ fontSize: '0.875rem' }}>
              Incluye resumen de liquidez, presupuestos activos y estado de finanzas.
            </p>
            <div
              className="auth-button"
              style={{
                width: '100%',
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <span>{t('reports.generateReport')}</span>
              )}
            </div>
          </button>

          <button
            className="option-card"
            onClick={handleExportExcel}
            disabled={!!exporting}
            style={{ border: 'none', textAlign: 'center', width: '100%' }}
          >
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <TableIcon size={40} style={{ color: '#10b981' }} />
            </div>
            <h4>{t('reports.downloadExcel')}</h4>
            <p className="stat-label" style={{ fontSize: '0.875rem' }}>
              Todas las transacciones, detalles de presupuestos y procesos logísticos.
            </p>
            <div
              className="auth-button"
              style={{
                width: '100%',
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {exporting === 'excel' ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <span>{t('reports.generateReport')}</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
