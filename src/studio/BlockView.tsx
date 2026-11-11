import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { blockRole, type FormBlock } from './types';

type BlockViewProps = {
  block: FormBlock;
  design: boolean;
  selected: boolean;
  onSelect: () => void;
  onChangeValue: (value: string) => void;
  onDragStart: (event: ReactPointerEvent) => void;
  onResizeStart: (event: ReactPointerEvent) => void;
};

const numberPattern = /^[\d\s.,%₽+\-−]+$/;

export function BlockView({ block, design, selected, onSelect, onChangeValue, onDragStart, onResizeStart }: BlockViewProps) {
  const style = block.style;
  const role = blockRole(block);
  const bare = block.type === 'field' || block.type === 'divider' || (block.type === 'text' && role !== 'note');
  const frame: CSSProperties = {
    position: 'absolute',
    left: block.x,
    top: block.y,
    width: block.w,
    height: block.h,
    background: style.background,
    color: style.color,
    border: bare || style.borderWidth <= 0 ? 'none' : `${style.borderWidth}px solid ${style.border}`,
    borderLeft: block.type === 'kpi' ? `3px solid ${style.accent}` : undefined,
    borderRadius: bare ? 0 : style.radius,
    padding: style.padding,
    boxSizing: 'border-box',
    overflow: 'hidden',
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    textAlign: style.align,
  };

  return (
    <div className={`blk${selected ? ' is-selected' : ''}`} style={frame} onPointerDown={design ? onDragStart : undefined} onClick={onSelect}>
      <div style={{ pointerEvents: design ? 'none' : 'auto', height: '100%' }}>{renderBody(block, onChangeValue)}</div>
      {design && selected ? (
        <button
          type="button"
          aria-label="Изменить размер"
          className="resize-handle"
          onPointerDown={(event) => {
            event.stopPropagation();
            onResizeStart(event);
          }}
        />
      ) : null}
    </div>
  );
}

function renderBody(block: FormBlock, onChangeValue: (value: string) => void) {
  if (block.type === 'text') return <TextBlock block={block} />;
  if (block.type === 'kpi') return <KpiBlock block={block} />;
  if (block.type === 'progress') return <ProgressBlock block={block} />;
  if (block.type === 'chart') return <ChartBlock block={block} />;
  if (block.type === 'table') return <TableBlock block={block} />;
  if (block.type === 'pairs') return <PairsBlock block={block} />;
  if (block.type === 'divider') return <DividerBlock block={block} />;
  return <FieldBlock block={block} onChangeValue={onChangeValue} />;
}

function TextBlock({ block }: { block: FormBlock }) {
  const role = blockRole(block);
  if (role === 'section') {
    return (
      <div
        className="blk-section"
        style={{ color: block.style.color, borderBottomColor: block.style.border, borderBottomWidth: Math.max(block.style.borderWidth, 1), fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}
      >
        {block.text}
      </div>
    );
  }
  const className = role === 'title' ? 'blk-title' : role === 'kicker' ? 'blk-kicker' : role === 'note' ? 'blk-note' : 'blk-meta';
  return (
    <div className={className} style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
      {block.text}
    </div>
  );
}

function KpiBlock({ block }: { block: FormBlock }) {
  return (
    <div className="blk-kpi">
      <span className="blk-kicker" style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
        {block.title}
      </span>
      <span className="blk-value" style={{ color: block.style.accent, fontSize: block.style.valueSize, fontWeight: block.style.fontWeight }}>
        {block.kpiValue}
      </span>
      {block.text ? (
        <span className="blk-caption" style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: 450 }}>
          {block.text}
        </span>
      ) : null}
    </div>
  );
}

function ProgressBlock({ block }: { block: FormBlock }) {
  const numeric = Number(String(block.kpiValue).replace(',', '.').replace(/[^\d.]/g, ''));
  const percent = Math.max(0, Math.min(100, Number.isFinite(numeric) ? numeric : 0));
  return (
    <div className="blk-kpi">
      <div className="pair-row">
        <span style={{ color: block.style.color, fontSize: block.style.fontSize }}>{block.title}</span>
        <span style={{ color: block.style.accent, fontSize: block.style.valueSize, fontWeight: block.style.fontWeight }}>{block.kpiValue}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%`, background: block.style.accent }} />
      </div>
      {block.text ? <span className="blk-caption" style={{ color: block.style.color, fontSize: block.style.fontSize }}>{block.text}</span> : null}
    </div>
  );
}

function DividerBlock({ block }: { block: FormBlock }) {
  return (
    <div className="divider-line">
      <span style={{ height: Math.max(block.style.borderWidth, 1), background: block.style.border === 'transparent' ? '#d5dce8' : block.style.border }} />
    </div>
  );
}

function PairsBlock({ block }: { block: FormBlock }) {
  return (
    <div className="blk-pairs">
      <span className="table-title" style={{ color: block.style.accent, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
        {block.title}
      </span>
      <div className="table-wrap">
        {block.rows.map((row, index) => (
          <div key={index} className="pair-row" style={{ borderBottomColor: block.style.border }}>
            <span style={{ color: block.style.color }}>{row[0]}</span>
            <span style={{ color: block.style.accent, fontWeight: block.style.fontWeight }}>{row[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartBlock({ block }: { block: FormBlock }) {
  const max = Math.max(...block.chart.map((point) => point.value), 1);
  const axis = Math.max(11, block.style.fontSize - 1);
  if (block.variant === 'line') {
    const min = Math.min(...block.chart.map((point) => point.value), 0);
    const span = Math.max(max - min, 1);
    const points = block.chart
      .map((point, index) => {
        const x = block.chart.length === 1 ? 50 : (index / (block.chart.length - 1)) * 100;
        const y = 36 - ((point.value - min) / span) * 32;
        return `${x},${y}`;
      })
      .join(' ');
    return (
      <div className="blk-chart">
        <div className="chart-head">
          <span className="chart-title" style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
            {block.title}
          </span>
        </div>
        <svg className="line-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
          <polyline points={points} fill="none" stroke={block.style.accent} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="line-labels">
          {block.chart.map((point, index) => (
            <span key={`${point.label}-${index}`} style={{ color: block.style.color, fontSize: axis }}>
              {point.label}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="blk-chart">
      <div className="chart-head">
        <span className="chart-title" style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
          {block.title}
        </span>
      </div>
      <div className="chart-plot">
        {block.chart.map((point, index) => (
          <div key={`${point.label}-${index}`} className="chart-col">
            <span className="chart-num" style={{ color: block.style.color, fontSize: axis }}>
              {point.value.toLocaleString('ru-RU')}
            </span>
            <div className="chart-bar-slot" style={{ borderBottomColor: block.style.border }}>
              <div className="chart-bar" style={{ height: `${(point.value / max) * 100}%`, background: block.style.accent }} />
            </div>
            <span className="chart-name" style={{ color: block.style.color, fontSize: axis }}>
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableBlock({ block }: { block: FormBlock }) {
  const align = block.style.align;
  return (
    <div className="blk-table">
      <div className="table-head">
        <span className="table-title" style={{ color: block.style.accent, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
          {block.title}
        </span>
      </div>
      <div className="table-wrap">
        <table style={{ fontSize: block.style.fontSize }}>
          <thead>
            <tr>
              {block.columns.map((column, index) => (
                <th key={`${column}-${index}`} style={{ color: block.style.color, textAlign: align, borderBottomColor: block.style.border }}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {block.columns.map((_, index) => {
                  const cell = row[index] ?? '';
                  const numeric = align === 'left' && numberPattern.test(cell);
                  return (
                    <td key={`${rowIndex}-${index}`} style={{ color: block.style.accent, textAlign: numeric ? 'right' : align, borderBottomColor: block.style.border }}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FieldBlock({ block, onChangeValue }: { block: FormBlock; onChangeValue: (value: string) => void }) {
  const controlStyle: CSSProperties = {
    color: block.style.accent,
    fontSize: block.style.valueSize,
    fontWeight: block.style.fontWeight,
    textAlign: block.style.align,
    borderBottomWidth: Math.max(block.style.borderWidth, 1),
    borderBottomColor: block.style.border === 'transparent' ? '#d0d7e2' : block.style.border,
  };
  return (
    <label className="field-block">
      <span className="field-label" style={{ color: block.style.color, fontSize: block.style.fontSize, fontWeight: block.style.fontWeight }}>
        {block.title}
      </span>
      {block.fieldKind === 'select' ? (
        <select className="field-control" style={controlStyle} value={block.value} onChange={(event) => onChangeValue(event.target.value)}>
          {block.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : block.fieldKind === 'area' ? (
        <textarea className="field-control field-area" style={controlStyle} value={block.value} onChange={(event) => onChangeValue(event.target.value)} />
      ) : (
        <input
          className="field-control"
          style={controlStyle}
          type={block.fieldKind === 'number' ? 'number' : block.fieldKind === 'date' ? 'date' : 'text'}
          value={block.value}
          onChange={(event) => onChangeValue(event.target.value)}
        />
      )}
    </label>
  );
}
