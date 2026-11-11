import { useRef, useState } from 'react';
import {
  Accordion,
  Alert,
  ALERT_COLOR,
  BookmarkIcon,
  Breadcrumbs,
  Button,
  BUTTON_VARIANT,
  Card,
  Chip,
  CHIP_SIZE,
  INPUT_STATUS,
  Input,
  Modal,
  PlayIcon,
  ResetIcon,
  Stack,
  TextArea,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
  useNotification,
} from 'ui-kit';
import { findForm } from '../data/forms';
import { defaultValues, runForm, validate } from '../engine';
import { createReportId, fromPersisted, loadReports, toPersisted } from '../storage';
import type { AnalyticForm, RunResult, SavedReport, Values } from '../types';
import { FieldControl } from './FieldControl';
import { FormGlyph } from './FormGlyph';
import { ResultPanel } from './ResultPanel';

type FormWorkspaceProps = {
  formId: string;
  snapshotId?: string;
  onSaved: (report: SavedReport) => void;
};

type StartState = {
  values: Values;
  applied: Values;
  groupBy: string;
  result: RunResult;
};

function readStart(form: AnalyticForm, snapshotId?: string): StartState {
  const snapshot = snapshotId
    ? loadReports().find((item) => item.id === snapshotId && item.formId === form.id)
    : undefined;
  const groupExists = snapshot && form.dimensions.some((item) => item.id === snapshot.groupBy);
  if (snapshot && groupExists) {
    const values = fromPersisted(form, snapshot.values);
    return {
      values,
      applied: values,
      groupBy: snapshot.groupBy,
      result: runForm(form, values, snapshot.groupBy),
    };
  }
  const values = defaultValues(form);
  const groupBy = form.dimensions[0].id;
  return { values, applied: values, groupBy, result: runForm(form, values, groupBy) };
}

export function FormWorkspace({ formId, snapshotId, onSaved }: FormWorkspaceProps) {
  const form = findForm(formId);
  if (!form) {
    return (
      <Stack direction="column" gap="12px">
        <Alert color={ALERT_COLOR.WARNING} hideClose>
          Такой формы нет в каталоге.
        </Alert>
        <Button
          onClick={() => {
            window.location.hash = '#/catalog';
          }}
        >
          К каталогу
        </Button>
      </Stack>
    );
  }
  return <FormBody form={form} snapshotId={snapshotId} onSaved={onSaved} />;
}

function FormBody({ form, snapshotId, onSaved }: { form: AnalyticForm; snapshotId?: string; onSaved: (report: SavedReport) => void }) {
  const notify = useNotification();
  const [start] = useState(() => readStart(form, snapshotId));
  const [values, setValues] = useState(start.values);
  const [applied, setApplied] = useState(start.applied);
  const [groupBy, setGroupBy] = useState(start.groupBy);
  const [result, setResult] = useState(start.result);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [nameError, setNameError] = useState('');
  const timer = useRef<number | undefined>(undefined);

  const dirty = JSON.stringify(toPersisted(form, values)) !== JSON.stringify(toPersisted(form, applied));

  const build = () => {
    const nextErrors = validate(form, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify.open('Проверьте параметры среза', { color: 'error' });
      return;
    }
    setLoading(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setApplied(values);
      setResult(runForm(form, values, groupBy));
      setLoading(false);
      notify.open('Срез построен', { color: 'success' });
    }, 420);
  };

  const reset = () => {
    const next = defaultValues(form);
    const group = form.dimensions[0].id;
    window.clearTimeout(timer.current);
    setValues(next);
    setApplied(next);
    setGroupBy(group);
    setErrors({});
    setLoading(false);
    setResult(runForm(form, next, group));
  };

  const openSave = () => {
    setName(
      `${form.title} · ${new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    );
    setComment('');
    setNameError('');
    setSaveOpen(true);
  };

  const confirmSave = () => {
    if (!name.trim()) {
      setNameError('Дайте снимку название');
      return;
    }
    onSaved({
      id: createReportId(),
      formId: form.id,
      name: name.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      values: toPersisted(form, applied),
      groupBy,
    });
    setSaveOpen(false);
    notify.open('Снимок сохранён в этом браузере', { color: 'success' });
  };

  return (
    <div className="stack-gap">
      <Breadcrumbs
        items={[
          {
            label: 'Формы',
            href: '#/catalog',
            onClick: (event) => {
              event.preventDefault();
              window.location.hash = '#/catalog';
            },
          },
          { label: form.title },
        ]}
      />
      <div className="page-head">
        <div>
          <Stack direction="row" gap="8px" alignItems="center">
            <FormGlyph icon={form.icon} color="primary" />
            <Typography variant={TYPOGRAPHY_VARIANT.HEADING2}>{form.title}</Typography>
            <Chip size={CHIP_SIZE.SMALL}>{form.domain}</Chip>
          </Stack>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            {form.description}
          </Typography>
          <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
            {form.owner} · обновлено {form.updated} · {form.facts.length.toLocaleString('ru-RU')} строк фактов
          </Typography>
        </div>
      </div>

      <div className="workspace">
        <Card title="Параметры">
          <div className="stack-gap">
            <div className="field-list">
              {form.fields.map((field) => (
                <FieldControl
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  onChange={(next) => {
                    setValues((prev) => ({ ...prev, [field.id]: next }));
                  }}
                />
              ))}
            </div>
            <Stack direction="row" gap="8px" wrap="wrap">
              <Button variant={BUTTON_VARIANT.CONTAINED} leftIcon={PlayIcon} loading={loading} onClick={build}>
                Построить
              </Button>
              <Button variant={BUTTON_VARIANT.OUTLINED} leftIcon={ResetIcon} onClick={reset}>
                Сбросить
              </Button>
            </Stack>
            <Accordion
              items={[
                {
                  title: 'Модель формы',
                  content: (
                    <Stack direction="column" gap="8px">
                      <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
                        Измерения
                      </Typography>
                      <Stack direction="row" gap="8px" wrap="wrap">
                        {form.dimensions.map((item) => (
                          <Chip key={item.id} size={CHIP_SIZE.SMALL} variant="outlined">
                            {item.label}
                          </Chip>
                        ))}
                      </Stack>
                      <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.SECONDARY}>
                        Меры
                      </Typography>
                      <Stack direction="row" gap="8px" wrap="wrap">
                        {form.measures.map((measure) => (
                          <Chip key={measure.id} size={CHIP_SIZE.SMALL}>
                            {`${measure.label} · ${measure.agg === 'sum' ? 'сумма' : 'среднее'}`}
                          </Chip>
                        ))}
                      </Stack>
                    </Stack>
                  ),
                },
              ]}
            />
          </div>
        </Card>

        <ResultPanel
          form={form}
          result={result}
          groupBy={groupBy}
          loading={loading}
          dirty={dirty}
          onGroupBy={(next) => {
            setGroupBy(next);
            setResult(runForm(form, applied, next));
          }}
          onSave={openSave}
        />
      </div>

      <Modal
        opened={saveOpen}
        onSetOpen={setSaveOpen}
        title="Сохранить снимок"
        closeByOutsideClick
        actions={
          <Stack direction="row" gap="8px">
            <Button variant={BUTTON_VARIANT.OUTLINED} onClick={() => setSaveOpen(false)}>
              Отмена
            </Button>
            <Button variant={BUTTON_VARIANT.CONTAINED} leftIcon={BookmarkIcon} onClick={confirmSave}>
              Сохранить
            </Button>
          </Stack>
        }
      >
        <div className="stack-gap">
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            В снимок попадёт последний построенный срез, не черновик параметров.
          </Typography>
          <Input
            title="Название"
            value={name}
            fullWidth
            status={nameError ? INPUT_STATUS.ERROR : undefined}
            hint={nameError || undefined}
            onChange={(event) => setName(event.target.value)}
          />
          <TextArea
            value={comment}
            placeholder="Комментарий к показу"
            fullWidth
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
