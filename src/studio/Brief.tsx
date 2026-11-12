import { Button, BUTTON_VARIANT } from 'ui-kit';

const pairs = [
  {
    now: 'Поле передвигают заявкой в разработку. Карточку видят после выпуска.',
    next: 'Карточку собирают на экране. Результат виден сразу, до внедрения.',
  },
  {
    now: 'Клиент, товар и договор выглядят одним длинным списком полей.',
    next: 'У каждой задачи свой набор: что важно для решения, стоит на первом экране.',
  },
  {
    now: 'На встрече согласуют текст требований, а не вид карточки.',
    next: 'Заказчик смотрит живую карточку и подтверждает именно тот экран, который увидит сотрудник.',
  },
  {
    now: 'Пустые поля и дубли смотрят в отчёте, когда данные уже ушли в договоры.',
    next: 'Заполненность и статус стоят в карточке, там, где запись исправляют.',
  },
  {
    now: 'Реквизиты в одном окне, выручка и динамика в другом.',
    next: 'Показатели стоят на той же карточке, рядом с реквизитами.',
  },
];

const lanes = [
  {
    role: 'Специалист по мастер-данным',
    steps: [
      { n: '1', title: 'Выбирает основу', text: 'Готовую карточку или пустой лист.' },
      { n: '2', title: 'Ставит блоки', text: 'Поля, статус, показатели, график, таблицу.' },
      { n: '3', title: 'Настраивает вид', text: 'Подписи, числа, цвет, размер и место.' },
    ],
  },
  {
    role: 'Заказчик',
    steps: [
      { n: '4', title: 'Открывает просмотр', text: 'Видит карточку без рамок настройки.' },
      { n: '5', title: 'Подтверждает вид', text: 'Этот макет становится образцом рабочей формы.' },
    ],
  },
];

const examples = [
  {
    id: 'Карточка контрагента',
    kicker: 'Клиент',
    title: 'Карточка контрагента',
    text: 'Реквизиты, статус, показатели сотрудничества и договоры на одном листе.',
  },
  {
    id: 'Продажи сети',
    kicker: 'Показатели',
    title: 'Продажи сети',
    text: 'Фильтры, факт к прошлому периоду и структура по округам рядом с карточкой.',
  },
  {
    id: 'Качество данных',
    kicker: 'Проверка',
    title: 'Качество данных',
    text: 'Заполненность, дубли и очередь разбора видны на форме, а не в отдельном отчёте.',
  },
];

export function Brief({ onOpen }: { onOpen: (layoutId?: string) => void }) {
  return (
    <main className="brief">
      <div className="brief-wrap">
        <header className="brief-hero">
          <p className="product-kicker">Конструктор форм MDM</p>
          <h1>Карточка, которую можно собрать и согласовать</h1>
          <p className="brief-lead">
            По карточке клиента, договора или товара принимают решения. Конструктор собирает её на экране и показывает заказчику тот вид, который увидит сотрудник.
          </p>
          <div className="brief-actions">
            <Button variant={BUTTON_VARIANT.CONTAINED} onClick={() => onOpen()}>
              Открыть конструктор
            </Button>
          </div>
        </header>

        <section className="brief-section">
          <h2>Сейчас и с конструктором</h2>
          <div className="brief-compare">
            <div className="brief-compare-head">
              <span>Сейчас</span>
              <span>С конструктором</span>
            </div>
            {pairs.map((item) => (
              <div key={item.now} className="brief-compare-row">
                <p>{item.now}</p>
                <p>{item.next}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="brief-section">
          <h2>Как этим пользуются</h2>
          <div className="brief-lanes">
            {lanes.map((lane) => (
              <div key={lane.role} className="brief-lane">
                <p>{lane.role}</p>
                <ol>
                  {lane.steps.map((step) => (
                    <li key={step.title}>
                      <span>{step.n}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="brief-section">
          <h2>Примеры карточек</h2>
          <div className="brief-examples">
            {examples.map((item) => (
              <button key={item.id} type="button" className="brief-example" onClick={() => onOpen(item.id)}>
                <span>{item.kicker}</span>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
