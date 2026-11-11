export type MeasureFormat = 'money' | 'number' | 'percent' | 'days';

export type MeasureDef = {
  id: string;
  label: string;
  format: MeasureFormat;
  agg: 'sum' | 'avg';
  weight?: string;
};

export type DimensionDef = {
  id: string;
  label: string;
};

export type FilterOp =
  | { op: 'dimEq'; dim: string; any: string }
  | { op: 'dimIn'; dim: string }
  | { op: 'dateFrom' }
  | { op: 'dateTo' }
  | { op: 'measureGte'; measure: string }
  | { op: 'flagLt'; measure: string; value: number }
  | { op: 'flagGt'; measure: string; value: number }
  | { op: 'search'; dims: string[] };

export type FieldType = 'select' | 'multi' | 'date' | 'number' | 'switch' | 'text';

export type FieldOption = {
  label: string;
  value: string;
};

export type FieldValue = string | string[] | boolean | Date | null;

export type FieldDef = {
  id: string;
  label: string;
  type: FieldType;
  hint?: string;
  required?: boolean;
  options?: FieldOption[];
  defaultValue: FieldValue;
  filter: FilterOp;
};

export type FactRow = {
  date: string;
  dims: Record<string, string>;
  measures: Record<string, number>;
};

export type AnalyticForm = {
  id: string;
  title: string;
  description: string;
  domain: string;
  owner: string;
  updated: string;
  icon: 'sales' | 'production' | 'finance' | 'people' | 'logistics';
  fields: FieldDef[];
  dimensions: DimensionDef[];
  measures: MeasureDef[];
  facts: FactRow[];
};

export type Values = Record<string, FieldValue>;

export type AggRow = {
  key: string;
  measures: Record<string, number>;
};

export type RunResult = {
  rows: AggRow[];
  totals: Record<string, number>;
  matched: number;
  delta: number | null;
};

export type PersistedValues = Record<string, string | string[] | boolean | null>;

export type SavedReport = {
  id: string;
  formId: string;
  name: string;
  comment: string;
  createdAt: string;
  values: PersistedValues;
  groupBy: string;
};

export type ThemeName = 'dark' | 'light' | 'galaxy';

export type Route =
  | { name: 'overview' }
  | { name: 'catalog' }
  | { name: 'reports' }
  | { name: 'form'; formId: string; snapshotId?: string };
