import { isoDay } from './format';
import type { AnalyticForm, FactRow, FieldDef, RunResult, Values } from './types';

export function defaultValues(form: AnalyticForm): Values {
  const values: Values = {};
  form.fields.forEach((field) => {
    const value = field.defaultValue;
    if (value instanceof Date) {
      values[field.id] = new Date(value.getTime());
    } else if (Array.isArray(value)) {
      values[field.id] = [...value];
    } else {
      values[field.id] = value;
    }
  });
  return values;
}

export function validate(form: AnalyticForm, values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  form.fields.forEach((field) => {
    const value = values[field.id];
    if (field.required && field.type === 'date' && !(value instanceof Date)) {
      errors[field.id] = 'Укажите дату';
    }
    if (field.required && field.type === 'select' && (value == null || value === '')) {
      errors[field.id] = 'Выберите значение';
    }
    if (field.type === 'number' && String(value ?? '').trim() !== '' && !Number.isFinite(Number(value))) {
      errors[field.id] = 'Нужно число';
    }
    if (field.type === 'date' && field.filter.op === 'dateTo') {
      const fromField = form.fields.find((item) => item.filter.op === 'dateFrom');
      const from = fromField ? values[fromField.id] : null;
      if (value instanceof Date && from instanceof Date && isoDay(value) < isoDay(from)) {
        errors[field.id] = 'Конец периода раньше начала';
      }
    }
  });
  return errors;
}

function applyField(rows: FactRow[], field: FieldDef, values: Values): FactRow[] {
  const filter = field.filter;
  const value = values[field.id];

  if (filter.op === 'dimEq') {
    if (typeof value !== 'string' || value === '' || value === filter.any) return rows;
    return rows.filter((row) => row.dims[filter.dim] === value);
  }

  if (filter.op === 'dimIn') {
    if (!Array.isArray(value) || value.length === 0) return rows;
    const selected = new Set(value);
    return rows.filter((row) => selected.has(row.dims[filter.dim]));
  }

  if (filter.op === 'dateFrom') {
    if (!(value instanceof Date)) return rows;
    const from = isoDay(value);
    return rows.filter((row) => row.date >= from);
  }

  if (filter.op === 'dateTo') {
    if (!(value instanceof Date)) return rows;
    const to = isoDay(value);
    return rows.filter((row) => row.date <= to);
  }

  if (filter.op === 'measureGte') {
    if (typeof value !== 'string' || value.trim() === '') return rows;
    const limit = Number(value);
    if (!Number.isFinite(limit)) return rows;
    return rows.filter((row) => (row.measures[filter.measure] ?? 0) >= limit);
  }

  if (filter.op === 'flagLt') {
    if (value !== true) return rows;
    return rows.filter((row) => (row.measures[filter.measure] ?? 0) < filter.value);
  }

  if (filter.op === 'flagGt') {
    if (value !== true) return rows;
    return rows.filter((row) => (row.measures[filter.measure] ?? 0) > filter.value);
  }

  if (typeof value !== 'string') return rows;
  const query = value.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => filter.dims.some((dim) => (row.dims[dim] ?? '').toLowerCase().includes(query)));
}

function aggregate(rows: FactRow[], form: AnalyticForm): Record<string, number> {
  const totals: Record<string, number> = {};
  form.measures.forEach((measure) => {
    if (rows.length === 0) {
      totals[measure.id] = 0;
      return;
    }
    if (measure.agg === 'sum') {
      totals[measure.id] = rows.reduce((sum, row) => sum + (row.measures[measure.id] ?? 0), 0);
      return;
    }
    const weightId = measure.weight;
    if (!weightId) {
      const sum = rows.reduce((acc, row) => acc + (row.measures[measure.id] ?? 0), 0);
      totals[measure.id] = sum / rows.length;
      return;
    }
    let weighted = 0;
    let weight = 0;
    rows.forEach((row) => {
      const rowWeight = Math.abs(row.measures[weightId] ?? 0);
      weighted += (row.measures[measure.id] ?? 0) * rowWeight;
      weight += rowWeight;
    });
    totals[measure.id] = weight ? weighted / weight : 0;
  });
  return totals;
}

function periodDelta(rows: FactRow[], measureId: string): number | null {
  const dates = [...new Set(rows.map((row) => row.date))].sort();
  if (dates.length < 2) return null;
  const mid = Math.floor(dates.length / 2);
  const first = new Set(dates.slice(0, mid));
  const second = new Set(dates.slice(mid));
  const sum = (bucket: Set<string>) =>
    rows.reduce((acc, row) => (bucket.has(row.date) ? acc + (row.measures[measureId] ?? 0) : acc), 0);
  const before = sum(first);
  const after = sum(second);
  if (!before) return null;
  return ((after - before) / Math.abs(before)) * 100;
}

export function runForm(form: AnalyticForm, values: Values, groupBy: string): RunResult {
  const filtered = form.fields.reduce((rows, field) => applyField(rows, field, values), form.facts);
  const groups = new Map<string, FactRow[]>();
  filtered.forEach((row) => {
    const key = row.dims[groupBy] ?? '—';
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  });
  const rows = [...groups.entries()]
    .map(([key, bucket]) => ({ key, measures: aggregate(bucket, form) }))
    .sort((left, right) => (right.measures[form.measures[0]?.id] ?? 0) - (left.measures[form.measures[0]?.id] ?? 0));
  const primary = form.measures[0]?.id;
  return {
    rows,
    totals: aggregate(filtered, form),
    matched: filtered.length,
    delta: primary ? periodDelta(filtered, primary) : null,
  };
}
