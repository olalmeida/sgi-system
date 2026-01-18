import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Budget, BudgetWithCurrency } from '../../types/database';

interface BudgetFormProps {
    onSubmit: (budget: Omit<Budget, 'id' | 'created_at' | 'spent_amount' | 'created_by'>) => Promise<{ error: string | null }>;
    onUpdate?: (id: string, updates: Partial<Omit<Budget, 'id' | 'created_at' | 'created_by'>>) => Promise<{ error: string | null }>;
    onClose: () => void;
    budget?: BudgetWithCurrency | null;
}

export function BudgetForm({ onSubmit, onUpdate, onClose, budget }: BudgetFormProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        total_amount: '',
        currency_code: 'USD',
        start_date: '',
        end_date: '',
    });

    const isEditMode = !!budget;

    useEffect(() => {
        if (budget) {
            setFormData({
                name: budget.name,
                total_amount: budget.total_amount.toString(),
                currency_code: budget.currency_code,
                start_date: budget.start_date || '',
                end_date: budget.end_date || '',
            });
        }
    }, [budget]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const budgetData = {
                name: formData.name,
                total_amount: parseFloat(formData.total_amount),
                currency_code: formData.currency_code,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };

            if (isEditMode && onUpdate && budget) {
                const { error } = await onUpdate(budget.id, budgetData);
                if (error) {
                    setError(error);
                    toast.error(t('budgets.updateError'));
                } else {
                    toast.success(t('budgets.updated'));
                    onClose();
                }
            } else {
                const { error } = await onSubmit(budgetData);
                if (error) {
                    setError(error);
                    toast.error(t('budgets.createError'));
                } else {
                    toast.success(t('budgets.created'));
                    onClose();
                }
            }
        } catch (err) {
            setError(isEditMode ? t('budgets.updateError') : t('budgets.createError'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            total_amount: '',
            currency_code: 'USD',
            start_date: '',
            end_date: '',
        });
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? t('budgets.editBudget') : t('budgets.newBudget')}</h2>
                    <button onClick={handleClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>{t('budgets.name')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder={t('budgets.name')}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('budgets.totalAmount')}</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.total_amount}
                            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
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
                        <label>{t('budgets.startDate')} {t('budgets.optional')}</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('budgets.endDate')} {t('budgets.optional')}</label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            min={formData.start_date}
                        />
                    </div>

                    {error && <div className="auth-message error">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (isEditMode ? t('common.loading') : t('common.loading')) : (
                            <>
                                {isEditMode ? <Save size={18} /> : <Plus size={18} />}
                                {isEditMode ? ` ${t('common.save')}` : ` ${t('budgets.newBudget')}`}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
