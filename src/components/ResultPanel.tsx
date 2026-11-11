import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ALERT_COLOR,
  BookmarkIcon,
  Button,
  BUTTON_SIZE,
  BUTTON_VARIANT,
  Card,
  DownloadIcon,
  Drawer,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
} from 'ui-kit';
import { formatMeasure } from '../format';
import type { AggRow, AnalyticForm, RunResult } from '../types';

type SortState = { key: string; dir: 'ASC' | 'DESC' } | null;

type ResultPanelProps = {
  form: AnalyticForm;
  result: RunResult;
  groupBy: string;
  loading: boolean;
  dirty: boolean;
  onGroupBy: (dimensionId: string) => void;
  onSave: () => void;
};

const PAGE_SIZE = 8;

export function ResultPanel({ form, result, groupBy, loading, dirty, onGroupBy, onSave }: ResultPanelProps) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<AggRow | null>(null);
  const dimension = form.dimensions.find((item) => item.id === groupBy) ?? form.dimensions[0];
  const primary = form.measures[0];

  useEffect(() => {
    setPage(1);
    setPicked(null);
  }, [result, groupBy]);

  const sorted = useMemo(() => {
    const copy = [...result.rows];
    if (!sort) return copy;
    copy.sort((left, right) => {
      if (sort.key === 'key') {
        return sort.dir === 'ASC' ? left.key.localeCompare(right.key, 'ru') : right.key.localeCompare(left.key, 'ru');
      }
      const delta = (left.measures[sort.key] ?? 0) - (right.measures[sort.key] ?? 0);
      return sort.dir === 'ASC' ? delta : -delta;
    });
    return copy;
  }, [result.rows, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const chartRows = sorted.slice(0, 8);
  const max = Math.max(...chartRows.map((row) => Math.abs(row.measures[primary.id] ?? 0)), 1);

  const toggle = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'DESC' };
      if (prev.dir === 'DESC') return { key, dir: 'ASC' };
      return null;
    });
    setPage(1);
  };

  return (
    <div className="result-pane">
      <Card
        title="Срез"
        suffix={`${result.rows.length.toLocaleString('ru-RU')} групп`}
        actions={
          <Stack direction="row" gap="8px">
            <Button size={BUTTON_SIZE.SMALL} variant={BUTTON_VARIANT.OUTLINED} leftIcon={DownloadIcon} onClick={() => downloadCsv(form, sorted, dimension.label)}>
              CSV
            </Button>
            <Button size={BUTTON_SIZE.SMALL} variant={BUTTON_VARIANT.CONTAINED} leftIcon={BookmarkIcon} onClick={onSave}>
              Снимок
            </Button>
          </Stack>
        }
      >
          <div className="stack-gap">
          <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
            {`${result.matched.toLocaleString('ru-RU')} строк фактов после фильтров`}
          </Typography>
          {dirty ? (
            <Alert color={ALERT_COLOR.WARNING} hideClose>
              Параметры изменились. Постройте срез заново, чтобы обновить цифры.
            </Alert>
          ) : null}
          <div className="group-by field">
            <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
              Группировка
            </Typography>
            <Select
              options={form.dimensions.map((item) => ({ label: item.label, value: item.id }))}
              value={groupBy}
              resettable={false}
              fullWidth
              onChange={(next) => onGroupBy(next)}
            />
          </div>
          <div className="kpi-grid">
            {form.measures.map((measure, index) => (
              <div key={measure.id} className="metric">
                <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
                  {measure.label}
                </Typography>
                <Typography variant={TYPOGRAPHY_VARIANT.HEADING4}>
                  {formatMeasure(result.totals[measure.id] ?? 0, measure.format)}
                </Typography>
                {index === 0 && result.delta != null ? (
                  <Typography
                    variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT}
                    color={result.delta >= 0 ? TYPOGRAPHY_COLOR.SUCCESS : TYPOGRAPHY_COLOR.ERROR}
                  >
                    {result.delta >= 0 ? '+' : '−'}
                    {Math.abs(result.delta).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}% — вторая половина к первой
                  </Typography>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title={primary.label} suffix={chartRows.length < sorted.length ? 'первые 8' : dimension.label}>
        {chartRows.length === 0 ? (
          <Alert color={ALERT_COLOR.WARNING} hideClose>
            Нет строк по этим параметрам. Ослабьте фильтры и постройте срез снова.
          </Alert>
        ) : (
          <div className="bars">
            {chartRows.map((row) => {
              const value = row.measures[primary.id] ?? 0;
              return (
                <div key={row.key} className="bar-row">
                  <span className="bar-name">{row.key}</span>
                  <div className="bar-track">
                    <div className={value < 0 ? 'bar-fill neg' : 'bar-fill'} style={{ width: `${(Math.abs(value) / max) * 100}%` }} />
                  </div>
                  <span className="bar-value">{formatMeasure(value, primary.format)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Таблица">
        <div className="table-wrap">
          <Table stickyHeader hasHovered>
            <TableHead>
              <TableRow>
                <TableCell isHeaderCell>
                  <TableSortLabel sortDirection={sort?.key === 'key' ? sort.dir : undefined} onClick={() => toggle('key')}>
                    {dimension.label}
                  </TableSortLabel>
                </TableCell>
                {form.measures.map((measure) => (
                  <TableCell key={measure.id} isHeaderCell textAlign="right">
                    <TableSortLabel sortDirection={sort?.key === measure.id ? sort.dir : undefined} onClick={() => toggle(measure.id)}>
                      {measure.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.key} selected={picked?.key === row.key} onClick={() => setPicked(row)}>
                  <TableCell>{row.key}</TableCell>
                  {form.measures.map((measure) => (
                    <TableCell key={measure.id} textAlign="right">
                      {formatMeasure(row.measures[measure.id] ?? 0, measure.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {pages > 1 ? (
          <div className="pager">
            <Pagination page={safePage} countPage={pages} onSetPage={(next) => setPage(next)} />
          </div>
        ) : null}
      </Card>

      {loading ? (
        <div className="loader-mask">
          <Typography variant={TYPOGRAPHY_VARIANT.BODY}>Считаем срез…</Typography>
        </div>
      ) : null}

      <Drawer opened={picked != null} onSetOpen={(opened) => { if (!opened) setPicked(null); }} title={picked?.key ?? ''} position="right" width="380px">
        {picked ? (
          <div className="stack-gap">
            <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
              {dimension.label}
            </Typography>
            {form.measures.map((measure) => (
              <div key={measure.id} className="metric">
                <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
                  {measure.label}
                </Typography>
                <Typography variant={TYPOGRAPHY_VARIANT.HEADING4}>
                  {formatMeasure(picked.measures[measure.id] ?? 0, measure.format)}
                </Typography>
              </div>
            ))}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

function downloadCsv(form: AnalyticForm, rows: AggRow[], groupLabel: string) {
  const header = [groupLabel, ...form.measures.map((measure) => measure.label)];
  const body = rows.map((row) => [row.key, ...form.measures.map((measure) => String(row.measures[measure.id] ?? 0))]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${form.id}-slice.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
