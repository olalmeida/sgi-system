import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, DollarSign, Calendar, Bell, User, Database, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';

export function SettingsView() {
    const { t, i18n } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'preferences' | 'profile' | 'notifications' | 'data'>('preferences');

    const handleLanguageChange = (lang: 'es' | 'en' | 'pt') => {
        updateSettings({ language: lang });
        i18n.changeLanguage(lang);
        toast.success(t('settings.saved'));
    };

    const handleCurrencyChange = (currency: 'USD' | 'EUR' | 'BRL' | 'ARS') => {
        updateSettings({ defaultCurrency: currency });
        toast.success(t('settings.saved'));
    };

    const handleDateFormatChange = (format: 'DD/MM/YYYY' | 'MM/DD/YYYY') => {
        updateSettings({ dateFormat: format });
        toast.success(t('settings.saved'));
    };

    const handleBudgetAlertsToggle = () => {
        updateSettings({ budgetAlerts: !settings.budgetAlerts });
        toast.success(t('settings.saved'));
    };

    const handleThresholdChange = (threshold: 70 | 80 | 90) => {
        updateSettings({ budgetThreshold: threshold });
        toast.success(t('settings.saved'));
    };

    const handleExportData = () => {
        toast.success(t('settings.exporting'));
        // TODO: Implement data export
    };

    const handleClearCache = () => {
        localStorage.clear();
        toast.success(t('settings.cacheCleared'));
        window.location.reload();
    };

    const handleDeleteAccount = () => {
        if (confirm(t('settings.deleteAccountConfirm'))) {
            toast.error(t('settings.notImplemented'));
            // TODO: Implement account deletion
        }
    };

    return (
        <div className="settings-view">
            <div style={{ marginBottom: '2rem' }}>
                <h1>{t('settings.title')}</h1>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    <SettingsIcon size={18} />
                    {t('settings.preferences')}
                </button>
                <button
                    className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} />
                    {t('settings.profile')}
                </button>
                <button
                    className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} />
                    {t('settings.notifications')}
                </button>
                <button
                    className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
                    onClick={() => setActiveTab('data')}
                >
                    <Database size={18} />
                    {t('settings.data')}
                </button>
            </div>

            {/* Content */}
            <div className="settings-content">
                {activeTab === 'preferences' && (
                    <div className="settings-section">
                        <h2>{t('settings.preferences')}</h2>

                        <div className="setting-item">
                            <div className="setting-info">
                                <Globe size={20} />
                                <div>
                                    <h3>{t('settings.language')}</h3>
                                    <p className="stat-label">{t('settings.languageDesc')}</p>
                                </div>
                            </div>
                            <select
                                value={settings.language}
                                onChange={(e) => handleLanguageChange(e.target.value as any)}
                                className="setting-select"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                                <option value="pt">Português</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <DollarSign size={20} />
                                <div>
                                    <h3>{t('settings.defaultCurrency')}</h3>
                                    <p className="stat-label">{t('settings.currencyDesc')}</p>
                                </div>
                            </div>
                            <select
                                value={settings.defaultCurrency}
                                onChange={(e) => handleCurrencyChange(e.target.value as any)}
                                className="setting-select"
                            >
                                <option value="USD">{t('common.currencies.USD')}</option>
                                <option value="EUR">{t('common.currencies.EUR')}</option>
                                <option value="BRL">{t('common.currencies.BRL')}</option>
                                <option value="ARS">{t('common.currencies.ARS')}</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <Calendar size={20} />
                                <div>
                                    <h3>{t('settings.dateFormat')}</h3>
                                    <p className="stat-label">{t('settings.dateFormatDesc')}</p>
                                </div>
                            </div>
                            <select
                                value={settings.dateFormat}
                                onChange={(e) => handleDateFormatChange(e.target.value as any)}
                                className="setting-select"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <h2>{t('settings.profile')}</h2>

                        <div className="setting-item">
                            <div className="setting-info">
                                <User size={20} />
                                <div>
                                    <h3>{t('settings.email')}</h3>
                                    <p className="stat-label">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <div>
                                    <h3>{t('settings.fullName')}</h3>
                                    <p className="stat-label">{t('settings.fullNameDesc')}</p>
                                </div>
                            </div>
                            <input
                                type="text"
                                defaultValue={user?.user_metadata?.full_name || ''}
                                className="setting-input"
                                placeholder={t('settings.fullName')}
                            />
                        </div>

                        <button className="action-button" style={{ marginTop: '1rem' }}>
                            <Save size={18} />
                            {t('common.save')}
                        </button>

                        {/* Delete Account - Moved from Data tab */}
                        <div className="setting-item" style={{ borderTop: '1px solid var(--error)', paddingTop: '1.5rem', marginTop: '2rem' }}>
                            <div className="setting-info">
                                <Trash2 size={20} style={{ color: 'var(--error)' }} />
                                <div>
                                    <h3 style={{ color: 'var(--error)' }}>{t('settings.deleteAccount')}</h3>
                                    <p className="stat-label">{t('settings.deleteAccountDesc')}</p>
                                </div>
                            </div>
                            <button className="action-button danger" onClick={handleDeleteAccount}>
                                {t('settings.deleteAccount')}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="settings-section">
                        <h2>{t('settings.notifications')}</h2>

                        <div className="setting-item">
                            <div className="setting-info">
                                <Bell size={20} />
                                <div>
                                    <h3>{t('settings.budgetAlerts')}</h3>
                                    <p className="stat-label">{t('settings.budgetAlertsDesc')}</p>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.budgetAlerts}
                                    onChange={handleBudgetAlertsToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        {settings.budgetAlerts && (
                            <div className="setting-item">
                                <div className="setting-info">
                                    <div>
                                        <h3>{t('settings.budgetThreshold')}</h3>
                                        <p className="stat-label">{t('settings.budgetThresholdDesc')}</p>
                                    </div>
                                </div>
                                <select
                                    value={settings.budgetThreshold}
                                    onChange={(e) => handleThresholdChange(Number(e.target.value) as any)}
                                    className="setting-select"
                                >
                                    <option value="70">70%</option>
                                    <option value="80">80%</option>
                                    <option value="90">90%</option>
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="settings-section">
                        <h2>{t('settings.data')}</h2>

                        <div className="setting-item">
                            <div className="setting-info">
                                <Database size={20} />
                                <div>
                                    <h3>{t('settings.exportData')}</h3>
                                    <p className="stat-label">{t('settings.exportDataDesc')}</p>
                                </div>
                            </div>
                            <button className="action-button" onClick={handleExportData}>
                                {t('settings.exportData')}
                            </button>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <Trash2 size={20} />
                                <div>
                                    <h3>{t('settings.clearCache')}</h3>
                                    <p className="stat-label">{t('settings.clearCacheDesc')}</p>
                                </div>
                            </div>
                            <button className="action-button" onClick={handleClearCache}>
                                {t('settings.clearCache')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
