import { Button, BUTTON_COLOR, BUTTON_VARIANT, ColorPicker, DeleteIcon, Input, Typography, TYPOGRAPHY_VARIANT } from 'ui-kit';
import { blockRole, type BlockStyle, type BlockType, type FieldKind, type FormBlock, type FormLayout, type TextAlign, type TextRole } from './types';

const typeName: Record<BlockType, string> = {
  field: 'Поле',
  kpi: 'Показатель',
  chart: 'Диаграмма',
  table: 'Таблица',
  text: 'Текст',
  divider: 'Линия',
  progress: 'Доля',
  pairs: 'Параметры',
};

const roles: { value: TextRole; label: string }[] = [
  { value: 'title', label: 'Заголовок' },
  { value: 'section', label: 'Раздел' },
  { value: 'kicker', label: 'Надзаголовок' },
  { value: 'meta', label: 'Подпись' },
  { value: 'note', label: 'Плашка' },
];

const kinds: { value: FieldKind; label: string }[] = [
  { value: 'text', label: 'Текст' },
  { value: 'number', label: 'Число' },
  { value: 'date', label: 'Дата' },
  { value: 'select', label: 'Список' },
  { value: 'area', label: 'Абзац' },
];

const aligns: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Слева' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'Справа' },
];

const weights: { value: number; label: string }[] = [
  { value: 400, label: 'Обычный' },
  { value: 500, label: 'Средний' },
  { value: 650, label: 'Полужирный' },
  { value: 700, label: 'Жирный' },
];

function readNumber(raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function FormProps({ layout, onChange }: { layout: FormLayout; onChange: (recipe: (current: FormLayout) => FormLayout) => void }) {
  const setCanvas = (patch: Partial<FormLayout['canvas']>) => onChange((current) => ({ ...current, canvas: { ...current.canvas, ...patch } }));
  return (
    <div className="prop-block">
      <p className="panel-kicker">Форма</p>
      <Typography variant={TYPOGRAPHY_VARIANT.HEADING5}>{layout.name}</Typography>
      <Input title="Название" value={layout.name} fullWidth onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} />
      <label className="prop-field">
        <span>Описание</span>
        <textarea className="prop-area" rows={3} value={layout.description} onChange={(event) => onChange((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <div className="coord-grid">
        <Input title="Ширина листа" value={String(layout.canvas.width)} onChange={(event) => { const value = readNumber(event.target.value); if (value !== null) setCanvas({ width: Math.max(480, value) }); }} />
        <Input title="Высота листа" value={String(layout.canvas.height)} onChange={(event) => { const value = readNumber(event.target.value); if (value !== null) setCanvas({ height: Math.max(320, value) }); }} />
      </div>
      <ColorRow label="Фон листа" value={layout.canvas.background} onChange={(background) => setCanvas({ background })} />
      <p className="panel-copy">Выберите блок, чтобы менять его содержание, положение и оформление.</p>
    </div>
  );
}

export function Inspector({ block, onChange, onDelete }: { block: FormBlock; onChange: (recipe: (block: FormBlock) => FormBlock) => void; onDelete: () => void }) {
  const setStyle = (patch: Partial<BlockStyle>) => onChange((current) => ({ ...current, style: { ...current.style, ...patch } }));
  const setNumber = (key: 'x' | 'y' | 'w' | 'h', raw: string) => {
    const value = readNumber(raw);
    if (value === null) return;
    onChange((current) => ({ ...current, [key]: value }));
  };
  const setStyleNumber = (key: 'radius' | 'fontSize' | 'valueSize' | 'padding' | 'borderWidth', raw: string) => {
    const value = readNumber(raw);
    if (value === null) return;
    setStyle({ [key]: Math.max(0, value) });
  };

  return (
    <div className="inspector">
      <p className="panel-kicker">{typeName[block.type]}</p>
      <Typography variant={TYPOGRAPHY_VARIANT.HEADING5}>Свойства</Typography>
      <ContentFields block={block} onChange={onChange} />
      <p className="panel-kicker">Положение</p>
      <div className="coord-grid">
        <Input title="X" value={String(block.x)} onChange={(event) => setNumber('x', event.target.value)} />
        <Input title="Y" value={String(block.y)} onChange={(event) => setNumber('y', event.target.value)} />
        <Input title="Ширина" value={String(block.w)} onChange={(event) => setNumber('w', event.target.value)} />
        <Input title="Высота" value={String(block.h)} onChange={(event) => setNumber('h', event.target.value)} />
      </div>
      <p className="panel-kicker">Оформление</p>
      <ColorRow label="Фон" value={block.style.background} onChange={(background) => setStyle({ background })} />
      <ColorRow label="Текст" value={block.style.color} onChange={(color) => setStyle({ color })} />
      <ColorRow label="Акцент" value={block.style.accent} onChange={(accent) => setStyle({ accent })} />
      <ColorRow label="Рамка" value={block.style.border} onChange={(border) => setStyle({ border })} />
      <div className="coord-grid">
        <Input title="Радиус" value={String(block.style.radius)} onChange={(event) => setStyleNumber('radius', event.target.value)} />
        <Input title="Отступ" value={String(block.style.padding)} onChange={(event) => setStyleNumber('padding', event.target.value)} />
        <Input title="Рамка, px" value={String(block.style.borderWidth)} onChange={(event) => setStyleNumber('borderWidth', event.target.value)} />
        <Input title="Кегль" value={String(block.style.fontSize)} onChange={(event) => setStyleNumber('fontSize', event.target.value)} />
        <Input title="Кегль значения" value={String(block.style.valueSize)} onChange={(event) => setStyleNumber('valueSize', event.target.value)} />
      </div>
      <Choice label="Начертание" value={String(block.style.fontWeight)} options={weights.map((item) => ({ value: String(item.value), label: item.label }))} onChange={(value) => setStyle({ fontWeight: Number(value) })} />
      <Choice label="Выравнивание" value={block.style.align} options={aligns} onChange={(align) => setStyle({ align: align as TextAlign })} />
      <Button color={BUTTON_COLOR.ERROR} variant={BUTTON_VARIANT.OUTLINED} leftIcon={DeleteIcon} onClick={onDelete}>
        Удалить блок
      </Button>
    </div>
  );
}

function ContentFields({ block, onChange }: { block: FormBlock; onChange: (recipe: (block: FormBlock) => FormBlock) => void }) {
  if (block.type === 'text') {
    return (
      <>
        <Choice label="Роль" value={blockRole(block)} options={roles} onChange={(textRole) => onChange((current) => ({ ...current, textRole: textRole as TextRole }))} />
        <label className="prop-field">
          <span>Текст</span>
          <textarea className="prop-area" rows={4} value={block.text} onChange={(event) => onChange((current) => ({ ...current, text: event.target.value }))} />
        </label>
      </>
    );
  }
  if (block.type === 'divider') return null;
  if (block.type === 'progress' || block.type === 'kpi') {
    return (
      <>
        <Input title="Подпись" value={block.title} fullWidth onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
        <Input title={block.type === 'progress' ? 'Проценты' : 'Значение'} value={block.kpiValue} fullWidth onChange={(event) => onChange((current) => ({ ...current, kpiValue: event.target.value }))} />
        <Input title="Пояснение" value={block.text} fullWidth onChange={(event) => onChange((current) => ({ ...current, text: event.target.value }))} />
      </>
    );
  }
  if (block.type === 'field') {
    return (
      <>
        <Input title="Подпись" value={block.title} fullWidth onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
        <Input title="Значение" value={block.value} fullWidth onChange={(event) => onChange((current) => ({ ...current, value: event.target.value }))} />
        <Choice label="Вид" value={block.fieldKind} options={kinds} onChange={(fieldKind) => onChange((current) => ({ ...current, fieldKind: fieldKind as FieldKind }))} />
        {block.fieldKind === 'select' ? (
          <ListEditor
            label="Пункты списка"
            rows={block.options.map((option) => [option])}
            headers={['Пункт']}
            addLabel="Добавить пункт"
            onChange={(rows) => onChange((current) => ({ ...current, options: rows.map((row) => row[0] ?? '') }))}
          />
        ) : null}
      </>
    );
  }
  if (block.type === 'chart') {
    return (
      <>
        <Input title="Заголовок" value={block.title} fullWidth onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
        <Choice
          label="Вид"
          value={block.variant === 'line' ? 'line' : 'bar'}
          options={[
            { value: 'bar', label: 'Столбцы' },
            { value: 'line', label: 'Линия' },
          ]}
          onChange={(variant) => onChange((current) => ({ ...current, variant }))}
        />
        <ListEditor
          label="Ряд"
          headers={['Подпись', 'Значение']}
          rows={block.chart.map((point) => [point.label, String(point.value)])}
          addLabel="Добавить точку"
          onChange={(rows) =>
            onChange((current) => ({
              ...current,
              chart: rows.map((row) => ({ label: row[0] ?? '', value: Number(row[1]) || 0 })),
            }))
          }
        />
      </>
    );
  }
  if (block.type === 'pairs') {
    return (
      <>
        <Input title="Заголовок" value={block.title} fullWidth onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
        <ListEditor
          label="Строки"
          headers={['Параметр', 'Значение']}
          rows={block.rows.map((row) => [row[0] ?? '', row[1] ?? ''])}
          addLabel="Добавить строку"
          onChange={(rows) => onChange((current) => ({ ...current, columns: ['Параметр', 'Значение'], rows }))}
        />
      </>
    );
  }
  return (
    <>
      <Input title="Заголовок" value={block.title} fullWidth onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))} />
      <ListEditor
        label="Колонки и строки"
        headers={block.columns}
        rows={block.rows}
        addLabel="Добавить строку"
        columnLabel="Добавить колонку"
        onChange={(rows, headers) => onChange((current) => ({ ...current, columns: headers ?? current.columns, rows }))}
      />
    </>
  );
}

function ListEditor({
  label,
  headers,
  rows,
  addLabel,
  columnLabel,
  onChange,
}: {
  label: string;
  headers: string[];
  rows: string[][];
  addLabel: string;
  columnLabel?: string;
  onChange: (rows: string[][], headers?: string[]) => void;
}) {
  const editHeader = (index: number, value: string) => onChange(rows, headers.map((header, headerIndex) => (headerIndex === index ? value : header)));
  const editCell = (rowIndex: number, cellIndex: number, value: string) =>
    onChange(
      rows.map((row, index) => (index === rowIndex ? row.map((cell, cellIndexInRow) => (cellIndexInRow === cellIndex ? value : cell)) : row)),
      headers,
    );

  return (
    <div className="prop-block">
      <p className="panel-kicker">{label}</p>
      {columnLabel ? (
        <div className="prop-stack">
          {headers.map((header, index) => (
            <div key={index} className="mini-row">
              <input className="prop-input" value={header} aria-label={`Колонка ${index + 1}`} onChange={(event) => editHeader(index, event.target.value)} />
              <button type="button" className="icon-x" aria-label="Удалить колонку" onClick={() => onChange(rows.map((row) => row.filter((_, cellIndex) => cellIndex !== index)), headers.filter((_, headerIndex) => headerIndex !== index))}>
                ×
              </button>
            </div>
          ))}
          <Button fullWidth variant={BUTTON_VARIANT.TEXT} onClick={() => onChange(rows.map((row) => [...row, '']), [...headers, 'Колонка'])}>
            {columnLabel}
          </Button>
        </div>
      ) : null}
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="prop-stack prop-card">
          {headers.map((header, cellIndex) => (
            <input
              key={cellIndex}
              className="prop-input"
              value={row[cellIndex] ?? ''}
              placeholder={header || `Значение ${cellIndex + 1}`}
              aria-label={header || `Значение ${cellIndex + 1}`}
              onChange={(event) => editCell(rowIndex, cellIndex, event.target.value)}
            />
          ))}
          <button type="button" className="text-button" onClick={() => onChange(rows.filter((_, index) => index !== rowIndex), headers)}>
            Удалить
          </button>
        </div>
      ))}
      <Button
        fullWidth
        variant={BUTTON_VARIANT.TEXT}
        onClick={() => onChange([...rows, headers.map(() => '')], headers)}
      >
        {addLabel}
      </Button>
    </div>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="prop-field">
      <span>{label}</span>
      <select className="prop-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="color-row">
      <span>{label}</span>
      <ColorPicker value={value} onChange={(next) => next && onChange(next)}>
        <span className="swatch" style={{ background: value }} />
      </ColorPicker>
    </label>
  );
}
