import { Plus, Edit, Trash2, Truck, Package, Search, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLogistics } from '../../hooks/useLogistics';
import type { LogisticsProcess } from '../../types/database';
import { LogisticsForm } from './LogisticsForm';

export function LogisticsView() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState<LogisticsProcess | null>(null);
  const { processes, loading, createProcess, updateProcess, deleteProcess } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(t('logistics.deleteConfirm'))) {
      const result = await deleteProcess(id);
      if (result.error) {
        toast.error(t('logistics.deleteError'));
      } else {
        toast.success(t('logistics.deleted'));
      }
    }
  };

  const handleEdit = (process: LogisticsProcess) => {
    setEditingProcess(process);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProcess(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('processId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOverColumn(status);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const processId = e.dataTransfer.getData('processId');

    if (!processId) return;

    const process = processes.find((p) => p.id === processId);
    if (process && process.status !== newStatus) {
      const { error } = await updateProcess(processId, {
        status: newStatus as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      });
      if (error) {
        toast.error(t('logistics.updateError'));
      } else {
        toast.success(t('logistics.updated'));
      }
    }
  };

  const filteredProcesses = processes.filter(
    (process) => !searchTerm || process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'pending', title: t('logistics.pending'), icon: <Package size={20} />, color: '#f59e0b' },
    {
      id: 'in_progress',
      title: t('logistics.inProgress'),
      icon: <Truck size={20} />,
      color: '#3b82f6',
    },
    {
      id: 'completed',
      title: t('logistics.completedStatus'),
      icon: <Package size={20} />,
      color: '#10b981',
    },
    { id: 'cancelled', title: t('logistics.cancelled'), icon: <X size={20} />, color: '#ef4444' },
  ];

  if (loading)
    return (
      <div className="empty-state">
        <p className="stat-label">{t('common.loading')}</p>
      </div>
    );

  return (
    <div className="logistics-view">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1>{t('logistics.title')}</h1>
        <button className="action-button" onClick={() => setShowForm(true)}>
          <Plus size={18} /> {t('logistics.newProcess')}
        </button>
      </div>

      {processes.length > 0 && (
        <div className="filters-container" style={{ marginBottom: '1.5rem' }}>
          <div className="filter-group">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('logistics.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="action-button"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              {t('logistics.clearSearch')}
            </button>
          )}
        </div>
      )}

      {processes.length === 0 ? (
        <div className="empty-state">
          <Truck size={64} className="empty-state-icon" />
          <h3>{t('logistics.noProcesses')}</h3>
          <p className="stat-label">{t('logistics.createFirst')}</p>
          <button
            className="auth-button"
            style={{ marginTop: '1rem' }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} /> {t('logistics.newProcess')}
          </button>
        </div>
      ) : (
        <div className={`logistics-board ${columns.length > 3 ? 'has-many-cols' : ''}`}>
          {columns.map((column) => (
            <div
              key={column.id}
              className={`logistics-column ${draggedOverColumn === column.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              role="group"
              aria-labelledby={`column-header-${column.id}`}
            >
              <div
                className="column-header"
                style={{ borderColor: column.color }}
                id={`column-header-${column.id}`}
              >
                {column.icon}
                <h3>
                  {column.title} ({filteredProcesses.filter((p) => p.status === column.id).length})
                </h3>
              </div>
              <div className="column-content">
                {filteredProcesses
                  .filter((p) => p.status === column.id)
                  .map((process) => (
                    <div
                      key={process.id}
                      className="process-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, process.id)}
                      role="listitem"
                    >
                      <div className="process-header">
                        <h3>{process.name}</h3>
                        <div className="process-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(process);
                            }}
                            className="icon-button edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(process.id);
                            }}
                            className="icon-button delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {process.details && (
                        <div className="process-details-preview">
                          {Object.entries(process.details as Record<string, unknown>)

                            .slice(0, 3)
                            .map(([key, val]) => (
                              <div key={key} className="detail-tag">
                                <span className="key">{key}:</span> {String(val)}
                              </div>
                            ))}
                          {Object.keys(process.details as Record<string, unknown>).length > 3 && (
                            <div className="more-details">...</div>
                          )}
                        </div>
                      )}

                      <div className="process-footer">
                        <span className="stat-label">
                          {new Date(process.created_at).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <LogisticsForm
          onSubmit={createProcess}
          onUpdate={updateProcess}
          onClose={handleCloseForm}
          process={editingProcess}
        />
      )}
    </div>
  );
}
