import { defaultStyle, type FormBlock, type FormLayout } from './types';

const nextId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const COL = [24, 316, 608, 900] as const;
const COL_W = 276;
const WIDE = 568;

const paper = '#f5f7fb';
const ink = '#142033';
const muted = '#5d6b82';
const line = '#d5dce8';
const card = '#ffffff';
const blue = '#1f4e9e';
const green = '#157a45';

function block(partial: Omit<FormBlock, 'id' | 'fieldKind' | 'options' | 'value' | 'kpiValue' | 'chart' | 'columns' | 'rows' | 'text' | 'textRole' | 'variant'> & Partial<FormBlock>): FormBlock {
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

function section(text: string, y: number): FormBlock {
  return block({
    type: 'text',
    x: 24,
    y,
    w: 1152,
    h: 24,
    title: 'Раздел',
    text,
    textRole: 'section',
    style: inkStyle({ color: muted, border: line, fontSize: 11, borderWidth: 1 }),
  });
}

function title(text: string, y = 40): FormBlock {
  return block({
    type: 'text',
    x: 24,
    y,
    w: 860,
    h: 36,
    title: 'Заголовок',
    text,
    textRole: 'title',
    style: inkStyle({ fontSize: 28, fontWeight: 650 }),
  });
}

function kicker(text: string): FormBlock {
  return block({
    type: 'text',
    x: 24,
    y: 18,
    w: 860,
    h: 16,
    title: 'Надзаголовок',
    text,
    textRole: 'kicker',
    style: inkStyle({ color: muted, fontSize: 12, fontWeight: 500 }),
  });
}

function meta(text: string): FormBlock {
  return block({
    type: 'text',
    x: 24,
    y: 80,
    w: 900,
    h: 20,
    title: 'Подпись',
    text,
    textRole: 'meta',
    style: inkStyle({ color: muted, fontSize: 13, fontWeight: 500 }),
  });
}

function field(partial: Partial<FormBlock> & Pick<FormBlock, 'x' | 'y' | 'title' | 'value'>): FormBlock {
  return block({
    type: 'field',
    w: COL_W,
    h: 64,
    fieldKind: 'text',
    style: inkStyle({ color: muted, accent: ink, border: 'transparent', fontSize: 11, valueSize: 15, fontWeight: 650 }),
    ...partial,
  });
}

function kpi(partial: Partial<FormBlock> & Pick<FormBlock, 'x' | 'y' | 'title' | 'kpiValue'>): FormBlock {
  return block({
    type: 'kpi',
    w: COL_W,
    h: 100,
    style: defaultStyle({ background: card, color: muted, accent: ink, border: line, radius: 8, fontSize: 12, valueSize: 26, padding: 16 }),
    ...partial,
  });
}

function sheet(name: string, description: string, blocks: FormBlock[], height = 860): FormLayout {
  return {
    id: name,
    name,
    description,
    canvas: { width: 1200, height, background: paper },
    blocks,
  };
}

const counterparty = (): FormLayout =>
  sheet(
    'Карточка контрагента',
    'Карточка юридического лица: реквизиты, показатели сотрудничества и договоры.',
    [
      kicker('Мастер-данные · Юридические лица'),
      title('ООО «Северная верфь»'),
      meta('ИНН 7703456789  ·  КПП 770301001  ·  ОГРН 1187746689012  ·  Москва'),
      kpi({
        x: 1000,
        y: 24,
        w: 176,
        h: 76,
        title: 'Статус',
        kpiValue: 'Действует',
        text: 'ЕГРЮЛ, 03.11.2026',
        style: defaultStyle({ background: '#e7f6ee', color: green, accent: green, border: '#cfe8da', radius: 8, fontSize: 13 }),
      }),
      section('Реквизиты', 116),
      field({ x: COL[0], y: 148, title: 'ИНН', value: '7703456789' }),
      field({ x: COL[1], y: 148, title: 'КПП', value: '770301001' }),
      field({ x: COL[2], y: 148, title: 'ОГРН', value: '1187746689012' }),
      field({
        x: COL[3],
        y: 148,
        title: 'Регион',
        fieldKind: 'select',
        value: 'Москва',
        options: ['Москва', 'Санкт-Петербург', 'Татарстан', 'Свердловская область'],
      }),
      section('Карточка', 228),
      field({
        x: 24,
        y: 260,
        w: WIDE,
        title: 'Полное наименование',
        value: 'Общество с ограниченной ответственностью «Северная верфь»',
      }),
      field({ x: COL[2], y: 260, title: 'Ответственный', value: 'Иванова А. С.' }),
      field({
        x: COL[3],
        y: 260,
        title: 'Сегмент',
        fieldKind: 'select',
        value: 'Крупный',
        options: ['Крупный', 'Средний', 'Малый'],
      }),
      field({ x: COL[0], y: 336, title: 'ОКВЭД', value: '25.11 — металлоконструкции' }),
      field({
        x: COL[1],
        y: 336,
        title: 'Налоговый режим',
        fieldKind: 'select',
        value: 'ОСН',
        options: ['ОСН', 'УСН', 'ЕСХН'],
      }),
      field({ x: COL[2], y: 336, title: 'Дата регистрации', value: '14.03.2018' }),
      field({ x: COL[3], y: 336, title: 'Группа', value: 'Промышленность' }),
      block({
        type: 'text',
        x: 24,
        y: 416,
        w: 1152,
        h: 56,
        title: 'Заключение',
        text: 'Ключевой поставщик контура «Производство». Наименование и адрес сверены с ЕГРЮЛ 03.11.2026, расхождений нет.',
        style: defaultStyle({ background: '#eef3fb', color: '#1e3a5f', accent: blue, border: '#d5e2f4', radius: 8, fontSize: 14 }),
      }),
      section('Показатели сотрудничества', 488),
      kpi({ x: COL[0], y: 520, h: 112, title: 'Договоры', kpiValue: '14', text: 'Действующих', style: defaultStyle({ background: card, color: muted, accent: blue, border: line }) }),
      kpi({ x: COL[1], y: 520, h: 112, title: 'Оборот, 12 мес.', kpiValue: '486,2 млн ₽', text: 'Без НДС' }),
      kpi({ x: COL[2], y: 520, h: 112, title: 'Просрочка', kpiValue: '0 ₽', text: 'На 11.11.2026', style: defaultStyle({ background: card, color: muted, accent: green, border: line }) }),
      kpi({ x: COL[3], y: 520, h: 112, title: 'Риск', kpiValue: 'Низкий', text: 'Внутренний рейтинг B1', style: defaultStyle({ background: card, color: muted, accent: green, border: line }) }),
      block({
        type: 'table',
        x: 24,
        y: 648,
        w: 1152,
        h: 248,
        title: 'Договоры',
        columns: ['Договор', 'Предмет', 'Сумма', 'Окончание', 'Статус'],
        rows: [
          ['Д-14/26', 'Поставка металла', '128,4 млн ₽', '30.06.2027', 'Исполняется'],
          ['Д-09/25', 'Сервисное обслуживание', '18,6 млн ₽', '31.12.2026', 'Исполняется'],
          ['Д-02/24', 'Аренда площадей', '6,1 млн ₽', '15.03.2026', 'Завершается'],
          ['Д-21/23', 'Подряд, корпус 4', '74,0 млн ₽', '01.09.2025', 'Закрыт'],
        ],
        style: defaultStyle({ background: card, color: muted, accent: ink, border: line }),
      }),
    ],
    940,
  );

const sales = (): FormLayout =>
  sheet(
    'Продажи сети',
    'Управленческий срез розницы: факт ноября против октября, структура по округам.',
    [
      kicker('Управленческая отчётность · Розничная сеть'),
      title('Продажи сети'),
      meta('Ноябрь 2026  ·  факт на 11 ноября  ·  сравнение с октябрём  ·  86 регионов'),
      field({ x: COL[0], y: 116, title: 'Период', fieldKind: 'select', value: 'Ноябрь 2026', options: ['Ноябрь 2026', 'Октябрь 2026', '2026, накопленно'] }),
      field({ x: COL[1], y: 116, title: 'Регион', fieldKind: 'select', value: 'Все округа', options: ['Все округа', 'Центр', 'Северо-Запад', 'Юг', 'Волга', 'Урал', 'Сибирь'] }),
      field({ x: COL[2], y: 116, title: 'Канал', fieldKind: 'select', value: 'Розница', options: ['Розница', 'Онлайн', 'Опт'] }),
      field({ x: COL[3], y: 116, title: 'Группа', fieldKind: 'select', value: 'Все группы', options: ['Все группы', 'Продукты', 'Непродовольственные', 'Собственное производство'] }),
      kpi({ x: COL[0], y: 200, h: 108, title: 'Выручка', kpiValue: '5,75 млрд ₽', text: '+4,2% к октябрю', style: defaultStyle({ background: card, color: muted, accent: blue, border: line }) }),
      kpi({ x: COL[1], y: 200, h: 108, title: 'Маржа', kpiValue: '1,16 млрд ₽', text: '20,1% выручки', style: defaultStyle({ background: card, color: muted, accent: green, border: line }) }),
      kpi({ x: COL[2], y: 200, h: 108, title: 'Заказы', kpiValue: '1,63 млн', text: '+1,8% к октябрю' }),
      kpi({ x: COL[3], y: 200, h: 108, title: 'Средний чек', kpiValue: '3 529 ₽', text: '−0,6% к октябрю' }),
      block({
        type: 'chart',
        x: 24,
        y: 328,
        w: 744,
        h: 292,
        title: 'Выручка по округам, млн ₽',
        chart: [
          { label: 'Центр', value: 1620 },
          { label: 'СЗ', value: 1007 },
          { label: 'Юг', value: 932 },
          { label: 'Волга', value: 840 },
          { label: 'Урал', value: 749 },
          { label: 'Сибирь', value: 602 },
        ],
        style: defaultStyle({ background: card, color: muted, accent: blue, border: line }),
      }),
      block({
        type: 'table',
        x: 784,
        y: 328,
        w: 392,
        h: 292,
        title: 'Структура',
        columns: ['Округ', 'Млн ₽', 'Доля', 'Маржа'],
        rows: [
          ['Центр', '1 620', '28,2%', '19,4%'],
          ['СЗ', '1 007', '17,5%', '18,7%'],
          ['Юг', '932', '16,2%', '20,2%'],
          ['Волга', '840', '14,6%', '19,1%'],
          ['Урал', '749', '13,0%', '21,0%'],
          ['Сибирь', '602', '10,5%', '18,4%'],
        ],
        style: defaultStyle({ background: card, color: muted, accent: ink, border: line }),
      }),
      block({
        type: 'text',
        x: 24,
        y: 636,
        w: 1152,
        h: 56,
        title: 'Комментарий',
        text: 'Ноябрь закрыт по 11 число, поэтому месяц ниже полного октября. Доля Центра — 28,2%. Маржа сети — 20,1%.',
        style: defaultStyle({ background: '#eef3fb', color: '#1e3a5f', accent: blue, border: '#d5e2f4', radius: 8, fontSize: 14 }),
      }),
      block({
        type: 'text',
        x: 24,
        y: 708,
        w: 1152,
        h: 20,
        title: 'Источник',
        text: 'Источник: витрина sales_monthly  ·  расчёт 11.11.2026, 06:40',
        style: inkStyle({ color: muted, fontSize: 12 }),
      }),
    ],
    760,
  );

const quality = (): FormLayout =>
  sheet(
    'Качество данных',
    'Контроль карточек контрагентов: полнота, дубли и очередь разбора.',
    [
      kicker('НСИ · Контроль качества'),
      title('Качество мастер-данных'),
      meta('Контрагенты  ·  48 216 карточек  ·  срез на 11.11.2026, 06:40'),
      kpi({ x: COL[0], y: 120, h: 108, title: 'Полнота', kpiValue: '96,4%', text: 'Обязательные реквизиты', style: defaultStyle({ background: card, color: muted, accent: blue, border: line }) }),
      kpi({ x: COL[1], y: 120, h: 108, title: 'Дубли', kpiValue: '128', text: 'Вероятные совпадения' }),
      kpi({ x: COL[2], y: 120, h: 108, title: 'Конфликты', kpiValue: '37', text: 'Расхождения источников', style: defaultStyle({ background: card, color: muted, accent: '#9a3412', border: line }) }),
      kpi({ x: COL[3], y: 120, h: 108, title: 'Без ИНН', kpiValue: '14', text: 'Блокируют проведение', style: defaultStyle({ background: card, color: muted, accent: '#9a3412', border: line }) }),
      block({
        type: 'chart',
        x: 24,
        y: 248,
        w: 520,
        h: 280,
        title: 'Заполненность по источникам, %',
        chart: [
          { label: '1С', value: 98 },
          { label: 'SAP', value: 94 },
          { label: 'CRM', value: 91 },
          { label: 'Витрина', value: 88 },
          { label: 'Ручной', value: 76 },
        ],
        style: defaultStyle({ background: card, color: muted, accent: blue, border: line }),
      }),
      block({
        type: 'table',
        x: 560,
        y: 248,
        w: 616,
        h: 280,
        title: 'Очередь разбора',
        columns: ['Карточка', 'Проблема', 'Источник', 'Приоритет'],
        rows: [
          ['ООО «Северная верфь»', 'Расхождение адреса', 'ЕГРЮЛ / 1С', 'Высокий'],
          ['АО «Невский причал»', 'Дубль по ИНН', 'CRM', 'Высокий'],
          ['ИП Сорокин П. А.', 'Не заполнен КПП', 'Ручной ввод', 'Средний'],
          ['ООО «Контур Снаб»', 'Пустой ОКВЭД', 'SAP', 'Низкий'],
          ['ПАО «Балтийский лизинг»', 'Конфликт наименования', 'Витрина', 'Средний'],
        ],
        style: defaultStyle({ background: card, color: muted, accent: ink, border: line }),
      }),
      block({
        type: 'text',
        x: 24,
        y: 544,
        w: 1152,
        h: 56,
        title: 'Правило',
        text: 'Приоритет «Высокий» останавливает заведение договора, пока оператор НСИ не подтвердит карточку.',
        style: defaultStyle({ background: '#f8f1ea', color: '#6b3410', accent: '#9a3412', border: '#f0dfd0', radius: 8, fontSize: 14 }),
      }),
      block({
        type: 'text',
        x: 24,
        y: 616,
        w: 1152,
        h: 20,
        title: 'Источник',
        text: 'Правила качества применяются при сохранении карточки  ·  контур НСИ',
        style: inkStyle({ color: muted, fontSize: 12 }),
      }),
    ],
    680,
  );

export function starterLayouts(): FormLayout[] {
  return [counterparty(), sales(), quality()];
}

export function blankLayout(): FormLayout {
  return {
    id: `form-${Date.now().toString(36)}`,
    name: 'Новая форма',
    description: 'Пустой лист. Блоки добавляются из библиотеки слева.',
    canvas: { width: 1200, height: 800, background: paper },
    blocks: [],
  };
}

export function createBlock(type: FormBlock['type'], x = 32, y = 32): FormBlock {
  if (type === 'kpi') {
    return kpi({ x, y, title: 'Показатель', kpiValue: '0', text: 'Подпись' });
  }
  if (type === 'chart') {
    return block({
      type,
      x,
      y,
      w: 520,
      h: 260,
      title: 'Динамика',
      chart: [
        { label: 'Июн', value: 420 },
        { label: 'Июл', value: 466 },
        { label: 'Авг', value: 438 },
        { label: 'Сен', value: 512 },
        { label: 'Окт', value: 548 },
        { label: 'Ноя', value: 390 },
      ],
      style: defaultStyle({ background: card, color: muted, accent: blue, border: line }),
    });
  }
  if (type === 'text') {
    return block({
      type: 'text',
      x,
      y,
      w: 560,
      h: 56,
      title: 'Текст',
      text: 'Текст блока. Цвет, фон и размер задаются в свойствах.',
      textRole: 'note',
      style: defaultStyle({ background: '#eef3fb', color: '#1e3a5f', accent: blue, border: '#d5e2f4', radius: 8, fontSize: 14 }),
    });
  }
  if (type === 'table') {
    return block({
      type: 'table',
      x,
      y,
      w: 640,
      h: 200,
      title: 'Таблица',
      columns: ['Показатель', 'Факт', 'План', 'Откл.'],
      rows: [
        ['Выручка', '486,2', '470,0', '+3,4%'],
        ['Маржа', '97,8', '94,0', '+4,0%'],
        ['Договоры', '14', '12', '+2'],
      ],
      style: defaultStyle({ background: card, color: muted, accent: ink, border: line }),
    });
  }
  return field({ x, y, title: 'Поле', value: '' });
}
