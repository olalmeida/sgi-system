import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';
import type { UserSettings } from './SettingsContext';

const defaultSettings: UserSettings = {
  language: 'es',
  defaultCurrency: 'USD',
  dateFormat: 'DD/MM/YYYY',
  budgetAlerts: true,
  budgetThreshold: 80,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('userSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    // Also ensure i18next is synced
    import('../i18n/config').then(({ default: i18n }) => {
      if (i18n.language !== settings.language) {
        i18n.changeLanguage(settings.language);
      }
    });
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('userSettings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
