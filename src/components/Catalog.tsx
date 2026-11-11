import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  BUTTON_SIZE,
  BUTTON_VARIANT,
  Card,
  Chip,
  CHIP_SIZE,
  Input,
  SearchIcon,
  Stack,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
} from 'ui-kit';
import { forms } from '../data/forms';
import type { AnalyticForm } from '../types';
import { FormGlyph } from './FormGlyph';

const domains = ['Все', ...Array.from(new Set(forms.map((form) => form.domain)))];

export function Catalog() {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('Все');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return forms.filter((form) => {
      if (domain !== 'Все' && form.domain !== domain) return false;
      if (!needle) return true;
      const haystack = [form.title, form.description, form.domain, form.owner, ...form.measures.map((item) => item.label)]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [domain, query]);

  return (
    <div className="stack-gap">
      <div className="page-head">
        <div>
          <Typography variant={TYPOGRAPHY_VARIANT.HEADING2}>Каталог форм</Typography>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Готовые срезы: параметры, измерения и меры уже собраны. Откройте форму и постройте отчёт.
          </Typography>
        </div>
      </div>

      <Card>
        <div className="stack-gap">
          <Input
            title="Поиск"
            placeholder="Название, домен или показатель"
            value={query}
            fullWidth
            leftIcon={SearchIcon}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Stack direction="row" gap="8px" wrap="wrap">
            {domains.map((item) => (
              <Chip
                key={item}
                size={CHIP_SIZE.SMALL}
                variant={item === domain ? 'contained' : 'outlined'}
                color={item === domain ? 'primary' : 'secondary'}
                onClick={() => setDomain(item)}
              >
                {item}
              </Chip>
            ))}
          </Stack>
        </div>
      </Card>

      {visible.length === 0 ? (
        <Alert color="warning" hideClose>
          Нет форм по этому запросу.
        </Alert>
      ) : (
        <div className="card-grid">
          {visible.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}

function FormCard({ form }: { form: AnalyticForm }) {
  const open = () => {
    window.location.hash = `#/form/${form.id}`;
  };

  return (
    <Card title={form.title} icon={<FormGlyph icon={form.icon} />} onClick={open}>
      <div className="stack-gap">
        <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
          <span className="clamp">{form.description}</span>
        </Typography>
        <Stack direction="row" gap="8px" wrap="wrap">
          <Chip size={CHIP_SIZE.SMALL} variant="outlined">
            {form.domain}
          </Chip>
          {form.measures.slice(0, 3).map((measure) => (
            <Chip key={measure.id} size={CHIP_SIZE.SMALL} variant="outlined">
              {measure.label}
            </Chip>
          ))}
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" fullWidth>
          <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
            {form.owner} · {form.updated}
          </Typography>
          <Button size={BUTTON_SIZE.SMALL} variant={BUTTON_VARIANT.TEXT} onClick={open}>
            Открыть
          </Button>
        </Stack>
      </div>
    </Card>
  );
}
