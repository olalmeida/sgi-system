import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserSettings {
    language: 'es' | 'en' | 'pt';
    defaultCurrency: 'USD' | 'EUR' | 'BRL' | 'ARS';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
    budgetAlerts: boolean;
    budgetThreshold: 70 | 80 | 90;
}

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => void;
    resetSettings: () => void;
}

const defaultSettings: UserSettings = {
    language: 'es',
    defaultCurrency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    budgetAlerts: true,
    budgetThreshold: 80,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(() => {
        const saved = localStorage.getItem('userSettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<UserSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
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

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
