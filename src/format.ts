import type { MeasureFormat } from './types';

export function isoDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMeasure(value: number, format: MeasureFormat): string {
  if (!Number.isFinite(value)) return '—';
  if (format === 'percent') {
    return `${value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
  }
  if (format === 'days') {
    return `${value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} дн.`;
  }
  if (format === 'money') {
    const abs = Math.abs(value);
    const sign = value < 0 ? '−' : '';
    if (abs >= 1_000_000) {
      return `${sign}${(abs / 1_000_000).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} млн ₽`;
    }
    return `${sign}${Math.round(abs).toLocaleString('ru-RU')} ₽`;
  }
  return Math.round(value).toLocaleString('ru-RU');
}

export function formatDelta(value: number | null): string | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${sign}${abs}%`;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
