import type { AnalyticForm, PersistedValues, SavedReport, ThemeName, Values } from './types';

const REPORTS_KEY = 'bi-studio-reports-v1';
const THEME_KEY = 'bi-studio-theme';

export function toPersisted(form: AnalyticForm, values: Values): PersistedValues {
  const persisted: PersistedValues = {};
  form.fields.forEach((field) => {
    const value = values[field.id];
    if (field.type === 'date') {
      persisted[field.id] = value instanceof Date ? value.toISOString() : null;
      return;
    }
    if (Array.isArray(value) || typeof value === 'string' || typeof value === 'boolean' || value == null) {
      persisted[field.id] = value;
    }
  });
  return persisted;
}

export function fromPersisted(form: AnalyticForm, persisted: PersistedValues): Values {
  const values: Values = {};
  form.fields.forEach((field) => {
    const value = persisted[field.id];
    if (field.type === 'date') {
      values[field.id] = typeof value === 'string' ? new Date(value) : null;
      return;
    }
    if (value === undefined) {
      const fallback = field.defaultValue;
      values[field.id] = fallback instanceof Date ? new Date(fallback.getTime()) : fallback;
      return;
    }
    values[field.id] = value;
  });
  return values;
}

export function loadReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReports(reports: SavedReport[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function createReportId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'galaxy') return stored;
  return 'dark';
}

export function saveTheme(theme: ThemeName) {
  localStorage.setItem(THEME_KEY, theme);
}
