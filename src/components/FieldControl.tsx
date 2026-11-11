import type { ReactNode } from 'react';
import {
  DatePicker,
  INPUT_STATUS,
  INPUT_TYPE,
  Input,
  MultiSelect,
  SELECT_STATUS,
  Select,
  Switch,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
} from 'ui-kit';
import type { FieldDef, FieldValue } from '../types';

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
        {label}
      </Typography>
      {children}
    </div>
  );
}

type FieldControlProps = {
  field: FieldDef;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
};

export function FieldControl({ field, value, error, onChange }: FieldControlProps) {
  const hint = error || field.hint;

  if (field.type === 'select') {
    return (
      <Labeled label={field.label}>
        <Select
          options={field.options}
          value={typeof value === 'string' ? value : null}
          resettable
          fullWidth
          hint={hint}
          status={error ? SELECT_STATUS.ERROR : undefined}
          onChange={(next) => onChange(next)}
        />
      </Labeled>
    );
  }

  if (field.type === 'multi') {
    return (
      <Labeled label={field.label}>
        <MultiSelect
          options={field.options}
          value={Array.isArray(value) ? value : []}
          fullWidth
          hint={hint}
          placeholder="Все"
          status={error ? SELECT_STATUS.ERROR : undefined}
          onChange={(next) => onChange(next)}
        />
      </Labeled>
    );
  }

  if (field.type === 'date') {
    return (
      <Labeled label={field.label}>
        <DatePicker
          value={value instanceof Date ? value : null}
          onChange={(next) => onChange(next)}
          fullWidth
          error={Boolean(error)}
          hint={hint}
        />
      </Labeled>
    );
  }

  if (field.type === 'switch') {
    return (
      <div className="field">
        <Switch label={field.label} checked={value === true} onChange={(event) => onChange(event.target.checked)} />
        {field.hint ? (
          <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
            {field.hint}
          </Typography>
        ) : null}
      </div>
    );
  }

  return (
    <Labeled label={field.label}>
      <Input
        type={field.type === 'number' ? INPUT_TYPE.NUMBER : INPUT_TYPE.TEXT}
        value={typeof value === 'string' ? value : ''}
        placeholder={field.type === 'number' ? 'Без порога' : field.hint}
        fullWidth
        hint={error}
        status={error ? INPUT_STATUS.ERROR : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Labeled>
  );
}
