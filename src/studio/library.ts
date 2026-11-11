import { defaultStyle, type FormBlock } from './types';

const ink = '#142033';
const muted = '#5d6b82';
const line = '#d5dce8';
const card = '#ffffff';
const blue = '#1f4e9e';
const green = '#157a45';

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function piece(partial: Omit<FormBlock, 'id' | 'fieldKind' | 'options' | 'value' | 'kpiValue' | 'chart' | 'columns' | 'rows' | 'text' | 'textRole' | 'variant'> & Partial<FormBlock>): FormBlock {
  return {
    id: nextId(partial.type),
    text: '',
    fieldKind: 'text',
    options: [],
    value: '',
    kpiValue: '',
    chart: [],
    columns: [],
    rows: [],
    textRole: 'meta',
    variant: '',
    ...partial,
  };
}

const inkStyle = (patch: Partial<FormBlock['style']> = {}) =>
  defaultStyle({ background: 'transparent', border: 'transparent', color: ink, radius: 0, padding: 0, borderWidth: 0, ...patch });

const cardStyle = (patch: Partial<FormBlock['style']> = {}) =>
  defaultStyle({ background: card, color: muted, accent: ink, border: line, radius: 8, fontSize: 13, valueSize: 26, padding: 16, ...patch });

export type LibraryItem = {
  id: string;
  group: string;
  label: string;
  hint: string;
  blocks: (x: number, y: number) => FormBlock[];
};

const months = [
  { label: 'Июн', value: 420 },
  { label: 'Июл', value: 466 },
  { label: 'Авг', value: 438 },
  { label: 'Сен', value: 512 },
  { label: 'Окт', value: 548 },
  { label: 'Ноя', value: 390 },
];

export const library: LibraryItem[] = [
  {
    id: 'title',
    group: 'Структура',
    label: 'Заголовок',
    hint: 'Имя формы',
    blocks: (x, y) => [
      piece({ type: 'text', x, y, w: 640, h: 40, title: 'Заголовок', text: 'Новая форма', textRole: 'title', style: inkStyle({ fontSize: 28 }) }),
    ],
  },
  {
    id: 'section',
    group: 'Структура',
    label: 'Раздел',
    hint: 'Линия раздела',
    blocks: (x, y) => [
      piece({ type: 'text', x, y, w: 1152, h: 24, title: 'Раздел', text: 'Раздел', textRole: 'section', style: inkStyle({ color: muted, border: line, fontSize: 11, borderWidth: 1 }) }),
    ],
  },
  {
    id: 'caption',
    group: 'Структура',
    label: 'Подпись',
    hint: 'Строка под заголовком',
    blocks: (x, y) => [
      piece({ type: 'text', x, y, w: 720, h: 22, title: 'Подпись', text: 'Пояснение к форме', textRole: 'meta', style: inkStyle({ color: muted, fontSize: 13, fontWeight: 500 }) }),
    ],
  },
  {
    id: 'note',
    group: 'Структура',
    label: 'Плашка',
    hint: 'Вывод или правило',
    blocks: (x, y) => [
      piece({
        type: 'text',
        x,
        y,
        w: 1152,
        h: 56,
        title: 'Плашка',
        text: 'Текст заключения. Цвет и отступ задаются в свойствах.',
        textRole: 'note',
        style: defaultStyle({ background: '#eef3fb', color: '#1e3a5f', accent: blue, border: '#d5e2f4', radius: 8, fontSize: 14, padding: 14 }),
      }),
    ],
  },
  {
    id: 'divider',
    group: 'Структура',
    label: 'Линия',
    hint: 'Горизонтальный разделитель',
    blocks: (x, y) => [
      piece({ type: 'divider', x, y, w: 1152, h: 16, title: 'Линия', style: inkStyle({ border: line, borderWidth: 1 }) }),
    ],
  },
  {
    id: 'field-text',
    group: 'Поля',
    label: 'Текст',
    hint: 'Реквизит',
    blocks: (x, y) => [
      piece({ type: 'field', x, y, w: 276, h: 64, title: 'Реквизит', value: '', fieldKind: 'text', style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }) }),
    ],
  },
  {
    id: 'field-number',
    group: 'Поля',
    label: 'Число',
    hint: 'Сумма или количество',
    blocks: (x, y) => [
      piece({ type: 'field', x, y, w: 276, h: 64, title: 'Сумма', value: '0', fieldKind: 'number', style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }) }),
    ],
  },
  {
    id: 'field-date',
    group: 'Поля',
    label: 'Дата',
    hint: 'Календарная дата',
    blocks: (x, y) => [
      piece({ type: 'field', x, y, w: 276, h: 64, title: 'Дата', value: '2026-11-11', fieldKind: 'date', style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }) }),
    ],
  },
  {
    id: 'field-select',
    group: 'Поля',
    label: 'Список',
    hint: 'Выбор из пунктов',
    blocks: (x, y) => [
      piece({
        type: 'field',
        x,
        y,
        w: 276,
        h: 64,
        title: 'Статус',
        value: 'Действует',
        fieldKind: 'select',
        options: ['Действует', 'Черновик', 'Архив'],
        style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }),
      }),
    ],
  },
  {
    id: 'field-area',
    group: 'Поля',
    label: 'Абзац',
    hint: 'Длинный текст',
    blocks: (x, y) => [
      piece({
        type: 'field',
        x,
        y,
        w: 568,
        h: 120,
        title: 'Комментарий',
        value: '',
        fieldKind: 'area',
        style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }),
      }),
    ],
  },
  {
    id: 'kpi',
    group: 'Показатели',
    label: 'Показатель',
    hint: 'Число и подпись',
    blocks: (x, y) => [
      piece({ type: 'kpi', x, y, w: 276, h: 108, title: 'Показатель', kpiValue: '0', text: 'Пояснение', style: cardStyle({ accent: blue }) }),
    ],
  },
  {
    id: 'status',
    group: 'Показатели',
    label: 'Статус',
    hint: 'Состояние карточки',
    blocks: (x, y) => [
      piece({
        type: 'kpi',
        x,
        y,
        w: 196,
        h: 76,
        title: 'Статус',
        kpiValue: 'Действует',
        text: 'Проверено',
        style: defaultStyle({ background: '#e7f6ee', color: green, accent: green, border: '#cfe8da', radius: 8, fontSize: 12, valueSize: 22, padding: 14 }),
      }),
    ],
  },
  {
    id: 'progress',
    group: 'Показатели',
    label: 'Доля',
    hint: 'Процент от 0 до 100',
    blocks: (x, y) => [
      piece({ type: 'progress', x, y, w: 360, h: 84, title: 'Полнота', kpiValue: '96,4', text: 'Обязательные реквизиты', style: cardStyle({ accent: blue, valueSize: 22 }) }),
    ],
  },
  {
    id: 'bars',
    group: 'Аналитика',
    label: 'Столбцы',
    hint: 'Сравнение ряда',
    blocks: (x, y) => [
      piece({ type: 'chart', x, y, w: 640, h: 260, title: 'Динамика', variant: 'bar', chart: months, style: cardStyle({ accent: blue, fontSize: 13 }) }),
    ],
  },
  {
    id: 'line',
    group: 'Аналитика',
    label: 'Линия',
    hint: 'Динамика по периодам',
    blocks: (x, y) => [
      piece({ type: 'chart', x, y, w: 640, h: 260, title: 'Динамика', variant: 'line', chart: months, style: cardStyle({ accent: blue, fontSize: 13 }) }),
    ],
  },
  {
    id: 'table',
    group: 'Аналитика',
    label: 'Таблица',
    hint: 'Колонки и строки',
    blocks: (x, y) => [
      piece({
        type: 'table',
        x,
        y,
        w: 720,
        h: 200,
        title: 'Таблица',
        columns: ['Показатель', 'Факт', 'План', 'Откл.'],
        rows: [
          ['Выручка', '486,2', '470,0', '+3,4%'],
          ['Маржа', '97,8', '94,0', '+4,0%'],
          ['Договоры', '14', '12', '+2'],
        ],
        style: cardStyle({ fontSize: 13, valueSize: 14 }),
      }),
    ],
  },
  {
    id: 'pairs',
    group: 'Аналитика',
    label: 'Параметры',
    hint: 'Пары «имя — значение»',
    blocks: (x, y) => [
      piece({
        type: 'pairs',
        x,
        y,
        w: 420,
        h: 188,
        title: 'Реквизиты',
        columns: ['Параметр', 'Значение'],
        rows: [
          ['ИНН', '7703456789'],
          ['КПП', '770301001'],
          ['ОГРН', '1187746689012'],
          ['Регион', 'Москва'],
        ],
        style: cardStyle({ fontSize: 13, valueSize: 14 }),
      }),
    ],
  },
  {
    id: 'pack-header',
    group: 'Заготовки',
    label: 'Шапка карточки',
    hint: 'Название, подпись и статус',
    blocks: (x, y) => [
      piece({ type: 'text', x, y, w: 760, h: 16, title: 'Надзаголовок', text: 'Мастер-данные · Юридические лица', textRole: 'kicker', style: inkStyle({ color: muted, fontSize: 12, fontWeight: 500 }) }),
      piece({ type: 'text', x, y: y + 20, w: 760, h: 36, title: 'Заголовок', text: 'Новая карточка', textRole: 'title', style: inkStyle({ fontSize: 28 }) }),
      piece({ type: 'text', x, y: y + 60, w: 760, h: 20, title: 'Подпись', text: 'ИНН  ·  КПП  ·  регион', textRole: 'meta', style: inkStyle({ color: muted, fontSize: 13, fontWeight: 500 }) }),
      piece({
        type: 'kpi',
        x: x + 800,
        y,
        w: 196,
        h: 76,
        title: 'Статус',
        kpiValue: 'Черновик',
        text: 'Не проверена',
        style: defaultStyle({ background: '#f4f1ea', color: '#8a5a12', accent: '#8a5a12', border: '#eadfcd', radius: 8, fontSize: 12, valueSize: 22, padding: 14 }),
      }),
    ],
  },
  {
    id: 'pack-filters',
    group: 'Заготовки',
    label: 'Фильтры',
    hint: 'Четыре поля в ряд',
    blocks: (x, y) =>
      [
        ['Период', 'Ноябрь 2026', ['Ноябрь 2026', 'Октябрь 2026', '2026, накопленно']],
        ['Регион', 'Все', ['Все', 'Центр', 'Северо-Запад', 'Юг']],
        ['Канал', 'Розница', ['Розница', 'Онлайн', 'Опт']],
        ['Группа', 'Все группы', ['Все группы', 'Продукты', 'Непродовольственные']],
      ].map(([title, value, options], index) =>
        piece({
          type: 'field',
          x: x + index * 292,
          y,
          w: 276,
          h: 64,
          title: String(title),
          value: String(value),
          fieldKind: 'select',
          options: options as string[],
          style: inkStyle({ color: muted, accent: ink, fontSize: 11, valueSize: 15 }),
        }),
      ),
  },
  {
    id: 'pack-kpis',
    group: 'Заготовки',
    label: 'Ряд показателей',
    hint: 'Четыре карточки',
    blocks: (x, y) =>
      [
        ['Выручка', '0', 'За период', blue],
        ['Маржа', '0', 'От выручки', green],
        ['Заказы', '0', 'За период', ink],
        ['Средний чек', '0', 'За период', ink],
      ].map(([title, value, caption, accent], index) =>
        piece({
          type: 'kpi',
          x: x + index * 292,
          y,
          w: 276,
          h: 108,
          title: String(title),
          kpiValue: String(value),
          text: String(caption),
          style: cardStyle({ accent: String(accent) }),
        }),
      ),
  },
];

export const libraryGroups = [...new Set(library.map((item) => item.group))];
