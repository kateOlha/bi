import { useMemo } from 'react';
import {
  Alert,
  ALERT_COLOR,
  Button,
  BUTTON_VARIANT,
  Card,
  CatalogIcon,
  Chip,
  CHIP_SIZE,
  Stack,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
  TYPOGRAPHY_WEIGHT,
} from 'ui-kit';
import { forms } from '../data/forms';
import { defaultValues, runForm } from '../engine';
import { formatDelta, formatMeasure, formatWhen } from '../format';
import type { SavedReport } from '../types';
import { FormGlyph } from './FormGlyph';

const headlines: { formId: string; measureId: string; title: string }[] = [
  { formId: 'sales', measureId: 'revenue', title: 'Выручка сети' },
  { formId: 'production', measureId: 'oee', title: 'OEE площадок' },
  { formId: 'finance', measureId: 'deviation', title: 'Отклонение от плана' },
  { formId: 'logistics', measureId: 'onTime', title: 'Поставки вовремя' },
];

export function Overview({ reports }: { reports: SavedReport[] }) {
  const cards = useMemo(
    () =>
      headlines.map((item) => {
        const form = forms.find((entry) => entry.id === item.formId);
        if (!form) return null;
        const measure = form.measures.find((entry) => entry.id === item.measureId);
        if (!measure) return null;
        const result = runForm(form, defaultValues(form), form.dimensions[0].id);
        return {
          ...item,
          value: formatMeasure(result.totals[measure.id] ?? 0, measure.format),
          delta: item.measureId === 'deviation' ? undefined : formatDelta(result.delta),
          hint: item.measureId === 'deviation' ? 'сумма факта минус план' : 'вторая половина периода к первой',
        };
      }),
    [],
  );

  const recent = reports.slice(0, 3);

  return (
    <div className="stack-gap">
      <div className="page-head">
        <div>
          <Typography variant={TYPOGRAPHY_VARIANT.HEADING2}>Обзор</Typography>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Пять преднастроенных форм. Каждая знает свои измерения, меры и параметры среза.
          </Typography>
          <div className="head-action">
            <Button
              variant={BUTTON_VARIANT.CONTAINED}
              leftIcon={CatalogIcon}
              onClick={() => {
                window.location.hash = '#/catalog';
              }}
            >
              Каталог форм
            </Button>
          </div>
        </div>
      </div>

      <Alert color={ALERT_COLOR.PRIMARY} hideClose>
        Демо-данные за июнь–ноябрь 2026, без сервера. Ноябрь обрезан 11-м числом. Снимки отчётов остаются в этом браузере.
      </Alert>

      <div className="kpi-grid">
        {cards.map((card) =>
          card ? (
            <Card key={card.formId} title={card.title} suffix={card.delta}>
              <Typography variant={TYPOGRAPHY_VARIANT.HEADING3} fontWeight={TYPOGRAPHY_WEIGHT.SEMI_BOLD}>
                {card.value}
              </Typography>
              <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
                {card.hint}
              </Typography>
            </Card>
          ) : null,
        )}
      </div>

      <div className="idea-grid">
        <Card title="Метаданные" icon={<Chip size={CHIP_SIZE.SMALL}>1</Chip>}>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Форма — это не экран, а набор полей, измерений и мер. Каталог уже заполнен.
          </Typography>
        </Card>
        <Card title="Срез" icon={<Chip size={CHIP_SIZE.SMALL}>2</Chip>}>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Параметры фильтруют факты, группировка собирает показатели. Таблица и график считаются вместе.
          </Typography>
        </Card>
        <Card title="Снимок" icon={<Chip size={CHIP_SIZE.SMALL}>3</Chip>}>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Сохранённый отчёт открывается с теми же параметрами. Удобно вернуться к срезу на показе.
          </Typography>
        </Card>
      </div>

      <Stack direction="row" justifyContent="space-between" alignItems="center" fullWidth>
        <Typography variant={TYPOGRAPHY_VARIANT.HEADING4}>Формы</Typography>
        <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
          {forms.length} в каталоге
        </Typography>
      </Stack>
      <div className="card-grid">
        {forms.map((form) => (
          <Card
            key={form.id}
            title={form.title}
            icon={<FormGlyph icon={form.icon} />}
            onClick={() => {
              window.location.hash = `#/form/${form.id}`;
            }}
          >
            <div className="stack-gap">
              <Chip size={CHIP_SIZE.SMALL} variant="outlined">
                {form.domain}
              </Chip>
              <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
                <span className="clamp">{form.description}</span>
              </Typography>
            </div>
          </Card>
        ))}
      </div>

      <Typography variant={TYPOGRAPHY_VARIANT.HEADING4}>Последние снимки</Typography>
      {recent.length === 0 ? (
        <Card title="Пока пусто">
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Постройте срез в любой форме и сохраните его. Снимок появится здесь.
          </Typography>
        </Card>
      ) : (
        <div className="card-grid">
          {recent.map((report) => {
            const form = forms.find((item) => item.id === report.formId);
            return (
              <Card
                key={report.id}
                title={report.name}
                suffix={form?.domain}
                onClick={() => {
                  window.location.hash = `#/form/${report.formId}?snapshot=${report.id}`;
                }}
              >
                <Stack direction="column" gap="6px">
                  <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
                    {form?.title ?? report.formId}
                  </Typography>
                  <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
                    {formatWhen(report.createdAt)}
                  </Typography>
                </Stack>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
