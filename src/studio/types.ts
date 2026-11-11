export type BlockType = 'field' | 'kpi' | 'chart' | 'text' | 'table' | 'divider' | 'progress' | 'pairs';

export type FieldKind = 'text' | 'select' | 'number' | 'date' | 'area';

export type TextRole = 'title' | 'section' | 'kicker' | 'meta' | 'note';

export type TextAlign = 'left' | 'center' | 'right';

export type BlockStyle = {
  background: string;
  color: string;
  accent: string;
  border: string;
  radius: number;
  fontSize: number;
  valueSize: number;
  padding: number;
  fontWeight: number;
  align: TextAlign;
  borderWidth: number;
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type FormBlock = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  text: string;
  fieldKind: FieldKind;
  options: string[];
  value: string;
  kpiValue: string;
  chart: ChartPoint[];
  columns: string[];
  rows: string[][];
  textRole: TextRole;
  variant: string;
  style: BlockStyle;
};

export type FormCanvas = {
  width: number;
  height: number;
  background: string;
};

export type FormLayout = {
  id: string;
  name: string;
  description: string;
  canvas: FormCanvas;
  blocks: FormBlock[];
};

const blockTypes: BlockType[] = ['field', 'kpi', 'chart', 'text', 'table', 'divider', 'progress', 'pairs'];
const fieldKinds: FieldKind[] = ['text', 'select', 'number', 'date', 'area'];
const aligns: TextAlign[] = ['left', 'center', 'right'];
const roles: TextRole[] = ['title', 'section', 'kicker', 'meta', 'note'];

export const defaultStyle = (patch: Partial<BlockStyle> = {}): BlockStyle => ({
  background: '#ffffff',
  color: '#1c2434',
  accent: '#2f6fed',
  border: '#d5dbe6',
  radius: 8,
  fontSize: 14,
  valueSize: 26,
  padding: 16,
  fontWeight: 650,
  align: 'left',
  borderWidth: 1,
  ...patch,
});

export function blockRole(block: Pick<FormBlock, 'textRole' | 'title' | 'style'>): TextRole {
  if (block.textRole && roles.includes(block.textRole)) return block.textRole;
  if (block.title === 'section') return 'section';
  if ((block.style?.fontSize ?? 14) >= 24) return 'title';
  if (block.style?.background && block.style.background !== 'transparent') return 'note';
  return 'meta';
}

export function normalizeLayout(raw: Partial<FormLayout> | null | undefined): FormLayout {
  const canvas = raw?.canvas;
  return {
    id: raw?.id || `form-${Date.now().toString(36)}`,
    name: raw?.name || 'Форма',
    description: raw?.description || '',
    canvas: {
      width: Number(canvas?.width) || 1200,
      height: Number(canvas?.height) || 800,
      background: canvas?.background || '#f5f7fb',
    },
    blocks: Array.isArray(raw?.blocks) ? raw.blocks.map((block) => normalizeBlock(block)) : [],
  };
}

export function normalizeBlock(raw: Partial<FormBlock> | null | undefined): FormBlock {
  const type = blockTypes.includes(raw?.type as BlockType) ? (raw?.type as BlockType) : 'text';
  const incoming: Partial<BlockStyle> = raw?.style ?? {};
  const style = defaultStyle(incoming);
  if (!aligns.includes(style.align)) style.align = 'left';
  const transparent = !style.background || style.background === 'transparent';
  if (incoming.padding === undefined && (type === 'field' || type === 'divider' || (type === 'text' && transparent))) style.padding = 0;
  if (incoming.borderWidth === undefined && (type === 'field' || type === 'divider' || (type === 'text' && transparent))) style.borderWidth = 0;
  if (incoming.valueSize === undefined && type === 'field') style.valueSize = style.fontSize || 15;
  if (incoming.valueSize === undefined && type === 'text') style.valueSize = style.fontSize || 14;
  const columns = Array.isArray(raw?.columns) ? raw.columns.map(String) : [];
  const rows = Array.isArray(raw?.rows) ? raw.rows.map((row) => (Array.isArray(row) ? row.map(String) : [])) : [];
  const block: FormBlock = {
    id: raw?.id || `block-${Math.random().toString(36).slice(2, 8)}`,
    type,
    x: Number(raw?.x) || 0,
    y: Number(raw?.y) || 0,
    w: Number(raw?.w) || 200,
    h: Number(raw?.h) || 80,
    title: raw?.title ?? '',
    text: raw?.text ?? '',
    fieldKind: fieldKinds.includes(raw?.fieldKind as FieldKind) ? (raw?.fieldKind as FieldKind) : 'text',
    options: Array.isArray(raw?.options) ? raw.options.map(String) : [],
    value: raw?.value ?? '',
    kpiValue: raw?.kpiValue ?? '',
    chart: Array.isArray(raw?.chart)
      ? raw.chart.map((point) => ({ label: String(point?.label ?? ''), value: Number(point?.value) || 0 }))
      : [],
    columns,
    rows: rows.map((row) => Array.from({ length: Math.max(columns.length, row.length) }, (_, index) => row[index] ?? '')),
    textRole: 'meta',
    variant: raw?.variant ?? '',
    style,
  };
  block.textRole = blockRole({ ...block, textRole: raw?.textRole as TextRole });
  return block;
}
