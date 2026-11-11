import type { AnalyticForm, FactRow, FieldDef, FieldOption } from '../types';

const PERIOD_FROM = new Date(2026, 5, 1);
const PERIOD_TO = new Date(2026, 10, 11);
const ALL = 'all';

const MONTHS = [
  { label: 'Июнь 2026', date: '2026-06-01', k: 0.9 },
  { label: 'Июль 2026', date: '2026-07-01', k: 0.94 },
  { label: 'Август 2026', date: '2026-08-01', k: 0.98 },
  { label: 'Сентябрь 2026', date: '2026-09-01', k: 1.05 },
  { label: 'Октябрь 2026', date: '2026-10-01', k: 1.12 },
  { label: 'Ноябрь 2026', date: '2026-11-01', k: 0.46 },
];

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function expand(
  seed: number,
  axes: { id: string; labels: string[] }[],
  build: (dims: Record<string, string>, rnd: () => number, monthK: number) => Record<string, number>,
): FactRow[] {
  const rnd = mulberry32(seed);
  const rows: FactRow[] = [];
  const walk = (index: number, dims: Record<string, string>) => {
    if (index === axes.length) {
      MONTHS.forEach((month) => {
        rows.push({
          date: month.date,
          dims: { ...dims, month: month.label },
          measures: build(dims, rnd, month.k),
        });
      });
      return;
    }
    axes[index].labels.forEach((label) => {
      walk(index + 1, { ...dims, [axes[index].id]: label });
    });
  };
  walk(0, {});
  return rows;
}

function withAll(labels: string[]): FieldOption[] {
  return [{ label: 'Все', value: ALL }, ...labels.map((label) => ({ label, value: label }))];
}

function periodFields(): FieldDef[] {
  return [
    {
      id: 'from',
      label: 'Период с',
      type: 'date',
      required: true,
      defaultValue: PERIOD_FROM,
      filter: { op: 'dateFrom' },
    },
    {
      id: 'to',
      label: 'Период по',
      type: 'date',
      required: true,
      hint: '11 ноября — последняя дата демо-набора',
      defaultValue: PERIOD_TO,
      filter: { op: 'dateTo' },
    },
  ];
}

const regions = ['Центр', 'Северо-Запад', 'Юг', 'Волга', 'Урал', 'Сибирь'];
const channels = ['Розница', 'Онлайн', 'Опт', 'Маркетплейс'];
const categories = ['Электроника', 'Дом', 'Продукты', 'Одежда'];
const regionK: Record<string, number> = {
  Центр: 1.45,
  'Северо-Запад': 0.92,
  Юг: 0.84,
  Волга: 0.76,
  Урал: 0.68,
  Сибирь: 0.54,
};
const channelK: Record<string, number> = { Розница: 1, Онлайн: 0.74, Опт: 0.62, Маркетплейс: 0.5 };
const categoryK: Record<string, number> = { Электроника: 1.35, Дом: 0.78, Продукты: 1.08, Одежда: 0.64 };

const plants = ['Казань', 'Тольятти', 'Екатеринбург', 'Новосибирск'];
const lines = ['Линия A', 'Линия B', 'Линия C'];
const shifts = ['Смена 1', 'Смена 2'];
const plantK: Record<string, number> = { Казань: 1.2, Тольятти: 1.05, Екатеринбург: 0.86, Новосибирск: 0.72 };

const cfos = ['Розница', 'Цифровые каналы', 'Производство', 'Логистика', 'Корпоративный центр'];
const articles = [
  { label: 'Выручка', sign: 1, base: 52_000_000 },
  { label: 'Себестоимость', sign: -1, base: 33_000_000 },
  { label: 'Коммерческие расходы', sign: -1, base: 7_400_000 },
  { label: 'Административные расходы', sign: -1, base: 4_800_000 },
];
const cfoK: Record<string, number> = {
  Розница: 1.3,
  'Цифровые каналы': 0.72,
  Производство: 0.96,
  Логистика: 0.44,
  'Корпоративный центр': 0.28,
};

const departments = ['Продажи', 'Производство', 'ИТ', 'Логистика', 'Финансы', 'HR'];
const cities = ['Москва', 'Казань', 'Самара', 'Новосибирск'];
const grades = ['Специалист', 'Ведущий', 'Руководитель'];
const deptK: Record<string, number> = { Продажи: 1.4, Производство: 1.7, ИТ: 0.85, Логистика: 0.7, Финансы: 0.42, HR: 0.28 };
const cityK: Record<string, number> = { Москва: 1.35, Казань: 0.8, Самара: 0.62, Новосибирск: 0.7 };
const gradePay: Record<string, number> = { Специалист: 95_000, Ведущий: 145_000, Руководитель: 230_000 };
const gradeHead: Record<string, number> = { Специалист: 1, Ведущий: 0.38, Руководитель: 0.12 };

const warehouses = ['Москва', 'Казань', 'Краснодар', 'Новосибирск'];
const carriers = ['Деловые линии', 'ПЭК', 'СДЭК', 'Собственный парк'];
const priorities = ['Стандарт', 'Экспресс'];
const warehouseK: Record<string, number> = { Москва: 1.4, Казань: 0.85, Краснодар: 0.7, Новосибирск: 0.62 };
const carrierK: Record<string, number> = { 'Деловые линии': 1, ПЭК: 0.82, СДЭК: 0.9, 'Собственный парк': 0.66 };

const monthDim = { id: 'month', label: 'Месяц' };

export const forms: AnalyticForm[] = [
  {
    id: 'sales',
    title: 'Продажи сети',
    description:
      'Выручка, маржа и заказы по регионам и каналам. Ноябрь в демо-наборе посчитан до 11 числа, поэтому месяц выглядит ниже октября.',
    domain: 'Коммерция',
    owner: 'Коммерческий блок',
    updated: '03.11.2026',
    icon: 'sales',
    dimensions: [
      { id: 'region', label: 'Регион' },
      { id: 'channel', label: 'Канал' },
      { id: 'category', label: 'Категория' },
      monthDim,
    ],
    measures: [
      { id: 'revenue', label: 'Выручка', format: 'money', agg: 'sum' },
      { id: 'margin', label: 'Маржа', format: 'money', agg: 'sum' },
      { id: 'orders', label: 'Заказы', format: 'number', agg: 'sum' },
      { id: 'avgCheck', label: 'Средний чек', format: 'money', agg: 'avg', weight: 'orders' },
    ],
    fields: [
      ...periodFields(),
      {
        id: 'region',
        label: 'Регион',
        type: 'select',
        options: withAll(regions),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'region', any: ALL },
      },
      {
        id: 'channel',
        label: 'Каналы',
        type: 'multi',
        hint: 'Пустой список — все каналы',
        options: channels.map((label) => ({ label, value: label })),
        defaultValue: [],
        filter: { op: 'dimIn', dim: 'channel' },
      },
      {
        id: 'category',
        label: 'Категория',
        type: 'select',
        options: withAll(categories),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'category', any: ALL },
      },
      {
        id: 'query',
        label: 'Поиск по срезу',
        type: 'text',
        hint: 'Регион, канал или категория',
        defaultValue: '',
        filter: { op: 'search', dims: ['region', 'channel', 'category'] },
      },
      {
        id: 'lowMargin',
        label: 'Только маржа ниже 18%',
        type: 'switch',
        defaultValue: false,
        filter: { op: 'flagLt', measure: 'marginPct', value: 18 },
      },
    ],
    facts: expand(11, [
      { id: 'region', labels: regions },
      { id: 'channel', labels: channels },
      { id: 'category', labels: categories },
    ], (dims, rnd, monthK) => {
      const revenue = Math.round(
        18_500_000 * regionK[dims.region] * channelK[dims.channel] * categoryK[dims.category] * monthK * (0.84 + rnd() * 0.32),
      );
      const marginPct = round1(12 + rnd() * 16);
      const margin = Math.round(revenue * (marginPct / 100));
      const avgCheck = Math.round((1400 + categoryK[dims.category] * 2200) * (0.85 + rnd() * 0.3));
      const orders = Math.max(1, Math.round(revenue / avgCheck));
      return { revenue, margin, orders, avgCheck, marginPct };
    }),
  },
  {
    id: 'production',
    title: 'Выпуск и простои',
    description: 'Выпуск, OEE, часы простоя и брак по площадкам, линиям и сменам.',
    domain: 'Производство',
    owner: 'Операционный контур',
    updated: '07.11.2026',
    icon: 'production',
    dimensions: [
      { id: 'plant', label: 'Площадка' },
      { id: 'line', label: 'Линия' },
      { id: 'shift', label: 'Смена' },
      monthDim,
    ],
    measures: [
      { id: 'output', label: 'Выпуск, т', format: 'number', agg: 'sum' },
      { id: 'oee', label: 'OEE', format: 'percent', agg: 'avg', weight: 'output' },
      { id: 'downtime', label: 'Простой, ч', format: 'number', agg: 'sum' },
      { id: 'defect', label: 'Брак', format: 'percent', agg: 'avg', weight: 'output' },
    ],
    fields: [
      ...periodFields(),
      {
        id: 'plant',
        label: 'Площадка',
        type: 'select',
        options: withAll(plants),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'plant', any: ALL },
      },
      {
        id: 'line',
        label: 'Линии',
        type: 'multi',
        hint: 'Пустой список — все линии',
        options: lines.map((label) => ({ label, value: label })),
        defaultValue: [],
        filter: { op: 'dimIn', dim: 'line' },
      },
      {
        id: 'shift',
        label: 'Смена',
        type: 'select',
        options: withAll(shifts),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'shift', any: ALL },
      },
      {
        id: 'minOutput',
        label: 'Выпуск не меньше, т',
        type: 'number',
        hint: 'Пусто — без порога',
        defaultValue: '',
        filter: { op: 'measureGte', measure: 'output' },
      },
      {
        id: 'lowOee',
        label: 'Только OEE ниже 75%',
        type: 'switch',
        defaultValue: false,
        filter: { op: 'flagLt', measure: 'oee', value: 75 },
      },
    ],
    facts: expand(23, [
      { id: 'plant', labels: plants },
      { id: 'line', labels: lines },
      { id: 'shift', labels: shifts },
    ], (dims, rnd, monthK) => {
      const lineFactor = dims.line === 'Линия A' ? 1.15 : dims.line === 'Линия B' ? 0.95 : 0.78;
      const shiftFactor = dims.shift === 'Смена 1' ? 1 : 0.86;
      const output = Math.round(980 * plantK[dims.plant] * lineFactor * shiftFactor * monthK * (0.8 + rnd() * 0.35));
      const oee = round1(clamp(70 + plantK[dims.plant] * 8 + rnd() * 12 - (dims.line === 'Линия C' ? 6 : 0), 62, 96));
      const downtime = Math.round(18 * (2.1 - lineFactor) * shiftFactor * (0.7 + rnd() * 0.8));
      const defect = round1(clamp(0.5 + rnd() * 2.6 + (dims.line === 'Линия C' ? 0.4 : 0), 0.3, 4.2));
      return { output, oee, downtime, defect };
    }),
  },
  {
    id: 'finance',
    title: 'Финансовый результат',
    description: 'План, факт и отклонение по ЦФО. Расходы в демо-наборе со знаком минус, выручка — с плюсом.',
    domain: 'Финансы',
    owner: 'Финансовый блок',
    updated: '01.11.2026',
    icon: 'finance',
    dimensions: [
      { id: 'cfo', label: 'ЦФО' },
      { id: 'article', label: 'Статья' },
      monthDim,
    ],
    measures: [
      { id: 'plan', label: 'План', format: 'money', agg: 'sum' },
      { id: 'fact', label: 'Факт', format: 'money', agg: 'sum' },
      { id: 'deviation', label: 'Отклонение', format: 'money', agg: 'sum' },
      { id: 'deviationPct', label: 'Отклонение, %', format: 'percent', agg: 'avg', weight: 'plan' },
    ],
    fields: [
      ...periodFields(),
      {
        id: 'cfo',
        label: 'ЦФО',
        type: 'select',
        options: withAll(cfos),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'cfo', any: ALL },
      },
      {
        id: 'article',
        label: 'Статья',
        type: 'select',
        options: withAll(articles.map((item) => item.label)),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'article', any: ALL },
      },
      {
        id: 'worse',
        label: 'Только хуже плана',
        type: 'switch',
        hint: 'Факт ниже плана: недобор выручки или перерасход',
        defaultValue: false,
        filter: { op: 'flagLt', measure: 'deviation', value: 0 },
      },
    ],
    facts: expand(41, [
      { id: 'cfo', labels: cfos },
      { id: 'article', labels: articles.map((item) => item.label) },
    ], (dims, rnd, monthK) => {
      const article = articles.find((item) => item.label === dims.article) ?? articles[0];
      const plan = Math.round(article.sign * article.base * cfoK[dims.cfo] * monthK * (0.92 + rnd() * 0.16));
      const fact = Math.round(plan * (0.9 + rnd() * 0.2));
      const deviation = fact - plan;
      const deviationPct = plan === 0 ? 0 : round1((deviation / Math.abs(plan)) * 100);
      return { plan, fact, deviation, deviationPct };
    }),
  },
  {
    id: 'people',
    title: 'Численность и текучесть',
    description: 'Штат, ФОТ, текучесть и открытые вакансии по подразделениям и городам.',
    domain: 'Персонал',
    owner: 'HR',
    updated: '28.10.2026',
    icon: 'people',
    dimensions: [
      { id: 'department', label: 'Подразделение' },
      { id: 'city', label: 'Город' },
      { id: 'grade', label: 'Грейд' },
      monthDim,
    ],
    measures: [
      { id: 'headcount', label: 'Численность', format: 'number', agg: 'sum' },
      { id: 'fot', label: 'ФОТ', format: 'money', agg: 'sum' },
      { id: 'turnover', label: 'Текучесть', format: 'percent', agg: 'avg', weight: 'headcount' },
      { id: 'vacancies', label: 'Вакансии', format: 'number', agg: 'sum' },
    ],
    fields: [
      ...periodFields(),
      {
        id: 'department',
        label: 'Подразделение',
        type: 'select',
        options: withAll(departments),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'department', any: ALL },
      },
      {
        id: 'city',
        label: 'Города',
        type: 'multi',
        hint: 'Пустой список — все города',
        options: cities.map((label) => ({ label, value: label })),
        defaultValue: [],
        filter: { op: 'dimIn', dim: 'city' },
      },
      {
        id: 'grade',
        label: 'Грейд',
        type: 'select',
        options: withAll(grades),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'grade', any: ALL },
      },
      {
        id: 'highTurnover',
        label: 'Только текучесть выше 10%',
        type: 'switch',
        defaultValue: false,
        filter: { op: 'flagGt', measure: 'turnover', value: 10 },
      },
    ],
    facts: expand(67, [
      { id: 'department', labels: departments },
      { id: 'city', labels: cities },
      { id: 'grade', labels: grades },
    ], (dims, rnd, monthK) => {
      const headcount = Math.max(
        1,
        Math.round(86 * deptK[dims.department] * cityK[dims.city] * gradeHead[dims.grade] * (0.85 + rnd() * 0.3) * (0.82 + monthK * 0.2)),
      );
      const fot = headcount * Math.round(gradePay[dims.grade] * (0.92 + rnd() * 0.16));
      const turnover = round1(clamp(3.5 + rnd() * 16 + (dims.department === 'Продажи' ? 3 : 0), 2, 24));
      const vacancies = Math.round(headcount * (0.03 + rnd() * 0.09));
      return { headcount, fot, turnover, vacancies };
    }),
  },
  {
    id: 'logistics',
    title: 'SLA поставок',
    description: 'Отгрузки, доля вовремя, срок и претензии по складам и перевозчикам.',
    domain: 'Логистика',
    owner: 'Цепь поставок',
    updated: '05.11.2026',
    icon: 'logistics',
    dimensions: [
      { id: 'warehouse', label: 'Склад' },
      { id: 'carrier', label: 'Перевозчик' },
      { id: 'priority', label: 'Приоритет' },
      monthDim,
    ],
    measures: [
      { id: 'shipments', label: 'Отгрузки', format: 'number', agg: 'sum' },
      { id: 'onTime', label: 'Вовремя', format: 'percent', agg: 'avg', weight: 'shipments' },
      { id: 'leadDays', label: 'Срок', format: 'days', agg: 'avg', weight: 'shipments' },
      { id: 'claims', label: 'Претензии', format: 'number', agg: 'sum' },
    ],
    fields: [
      ...periodFields(),
      {
        id: 'warehouse',
        label: 'Склад',
        type: 'select',
        options: withAll(warehouses),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'warehouse', any: ALL },
      },
      {
        id: 'carrier',
        label: 'Перевозчики',
        type: 'multi',
        hint: 'Пустой список — все перевозчики',
        options: carriers.map((label) => ({ label, value: label })),
        defaultValue: [],
        filter: { op: 'dimIn', dim: 'carrier' },
      },
      {
        id: 'priority',
        label: 'Приоритет',
        type: 'select',
        options: withAll(priorities),
        defaultValue: ALL,
        filter: { op: 'dimEq', dim: 'priority', any: ALL },
      },
      {
        id: 'query',
        label: 'Поиск',
        type: 'text',
        defaultValue: '',
        filter: { op: 'search', dims: ['warehouse', 'carrier', 'priority'] },
      },
      {
        id: 'lowSla',
        label: 'Только SLA ниже 95%',
        type: 'switch',
        defaultValue: false,
        filter: { op: 'flagLt', measure: 'onTime', value: 95 },
      },
    ],
    facts: expand(89, [
      { id: 'warehouse', labels: warehouses },
      { id: 'carrier', labels: carriers },
      { id: 'priority', labels: priorities },
    ], (dims, rnd, monthK) => {
      const priorityFactor = dims.priority === 'Экспресс' ? 0.42 : 1;
      const shipments = Math.round(240 * warehouseK[dims.warehouse] * carrierK[dims.carrier] * priorityFactor * monthK * (0.75 + rnd() * 0.4));
      const onTime = round1(clamp(86 + rnd() * 12 + (dims.priority === 'Экспресс' ? 2 : 0) - (dims.carrier === 'ПЭК' ? 2 : 0), 84, 99.4));
      const leadDays = dims.priority === 'Экспресс' ? round1(0.8 + rnd() * 1.3) : round1(2.2 + rnd() * 2.6);
      const claims = Math.round(shipments * (0.006 + rnd() * 0.02));
      return { shipments, onTime, leadDays, claims };
    }),
  },
];

export function findForm(id: string): AnalyticForm | undefined {
  return forms.find((form) => form.id === id);
}
