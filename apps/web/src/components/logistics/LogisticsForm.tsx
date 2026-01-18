import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { LogisticsProcess } from '../../types/database';

interface LogisticsFormProps {
    onSubmit: (process: Omit<LogisticsProcess, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<{ error: string | null }>;
    onUpdate?: (id: string, updates: Partial<Omit<LogisticsProcess, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => Promise<{ error: string | null }>;
    onClose: () => void;
    process?: LogisticsProcess | null;
}

export function LogisticsForm({ onSubmit, onUpdate, onClose, process }: LogisticsFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        assigned_to: null as string | null,
    });
    const [detailsList, setDetailsList] = useState<{ key: string; value: string }[]>([
        { key: '', value: '' }
    ]);

    const isEditMode = !!process;

    useEffect(() => {
        if (process) {
            setFormData({
                name: process.name,
                status: process.status,
                assigned_to: process.assigned_to,
            });

            if (process.details) {
                const detailsArr = Object.entries(process.details as Record<string, string>).map(([key, value]) => ({
                    key,
                    value: String(value)
                }));
                setDetailsList(detailsArr.length > 0 ? detailsArr : [{ key: '', value: '' }]);
            } else {
                setDetailsList([{ key: '', value: '' }]);
            }
        }
    }, [process]);

    const handleAddDetail = () => {
        setDetailsList([...detailsList, { key: '', value: '' }]);
    };

    const handleRemoveDetail = (index: number) => {
        const newList = detailsList.filter((_, i) => i !== index);
        setDetailsList(newList.length > 0 ? newList : [{ key: '', value: '' }]);
    };

    const handleDetailChange = (index: number, field: 'key' | 'value', value: string) => {
        const newList = [...detailsList];
        newList[index][field] = value;
        setDetailsList(newList);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Convert list to JSON object
            const detailsJson: Record<string, string> = {};
            detailsList.forEach(item => {
                if (item.key.trim()) {
                    detailsJson[item.key.trim()] = item.value;
                }
            });

            const processData = {
                name: formData.name,
                status: formData.status,
                assigned_to: formData.assigned_to,
                details: Object.keys(detailsJson).length > 0 ? detailsJson : null,
            };

            if (isEditMode && onUpdate && process) {
                const { error } = await onUpdate(process.id, processData);
                if (error) {
                    setError(error);
                    toast.error(t('logistics.updateError'));
                } else {
                    toast.success(t('logistics.updated'));
                    onClose();
                }
            } else {
                const { error } = await onSubmit(processData);
                if (error) {
                    setError(error);
                    toast.error(t('logistics.createError'));
                } else {
                    toast.success(t('logistics.created'));
                    onClose();
                }
            }
        } catch (err) {
            setError(isEditMode ? t('logistics.updateError') : t('logistics.createError'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
            assigned_to: null as string | null,
        });
        setDetailsList([{ key: '', value: '' }]);
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>{isEditMode ? t('logistics.editProcess') : t('logistics.newProcess')}</h2>
                    <button onClick={handleClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>{t('logistics.processName')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder={t('logistics.processName')}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('logistics.status')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            required
                        >
                            <option value="pending">{t('logistics.pending')}</option>
                            <option value="in_progress">{t('logistics.inProgress')}</option>
                            <option value="completed">{t('logistics.completedStatus')}</option>
                            <option value="cancelled">{t('logistics.cancelled')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ marginBottom: 0 }}>{t('logistics.details')}</label>
                            <button
                                type="button"
                                onClick={handleAddDetail}
                                className="action-button small"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                                <Plus size={14} /> {t('logistics.addRow')}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {detailsList.map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder={t('logistics.keyPlaceholder')}
                                        value={item.key}
                                        onChange={(e) => handleDetailChange(index, 'key', e.target.value)}
                                        className="setting-input"
                                        style={{ flex: 1, minWidth: 0 }}
                                    />
                                    <input
                                        type="text"
                                        placeholder={t('logistics.valuePlaceholder')}
                                        value={item.value}
                                        onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                                        className="setting-input"
                                        style={{ flex: 1, minWidth: 0 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDetail(index)}
                                        className="action-button danger tiny"
                                        style={{ padding: '8px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <div className="auth-message error">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (isEditMode ? t('common.loading') : t('common.loading')) : (
                            <>
                                {isEditMode ? <Save size={18} /> : <Plus size={18} />}
                                {isEditMode ? ` ${t('common.save')}` : ` ${t('logistics.newProcess')}`}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
