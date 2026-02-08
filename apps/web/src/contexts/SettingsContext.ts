import { createContext } from 'react';

export interface UserSettings {
  language: 'es' | 'en' | 'pt';
  defaultCurrency: 'USD' | 'EUR' | 'BRL' | 'ARS';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  budgetAlerts: boolean;
  budgetThreshold: 70 | 80 | 90;
}

export interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
