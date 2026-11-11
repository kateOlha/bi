import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  AppBar,
  AppBarContainer,
  AppBarItem,
  AppBarLogo,
  Button,
  BUTTON_SIZE,
  BUTTON_VARIANT,
  DashboardsIcon,
  DARK_THEME,
  LIGHT_THEME,
  ThemeProvider,
} from 'ui-kit';
import { BlockView } from './BlockView';
import { Brief } from './Brief';
import { FormProps, Inspector } from './Inspector';
import { library, libraryGroups, type LibraryItem } from './library';
import { blankLayout, starterLayouts } from './templates';
import { normalizeLayout, type FormBlock, type FormLayout } from './types';

const STORAGE_KEY = 'mdm-form-layouts-v8';

function loadLayouts(): FormLayout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return starterLayouts();
    const parsed = JSON.parse(raw) as Partial<FormLayout>[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map((item) => normalizeLayout(item)) : starterLayouts();
  } catch {
    return starterLayouts();
  }
}

function snap(value: number) {
  return Math.round(value / 8) * 8;
}

export function Studio() {
  const [layouts, setLayouts] = useState<FormLayout[]>(loadLayouts);
  const [activeId, setActiveId] = useState(layouts[0]?.id ?? '');
  const [design, setDesign] = useState(true);
  const [screen, setScreen] = useState<'brief' | 'work'>(() => (sessionStorage.getItem('mdm-screen') === 'work' ? 'work' : 'brief'));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts]);

  useEffect(() => {
    sessionStorage.setItem('mdm-screen', screen);
  }, [screen]);

  const openWork = (layoutId?: string) => {
    if (layoutId) setActiveId(layoutId);
    setSelectedId(null);
    setDesign(true);
    setScreen('work');
  };

  const layout = layouts.find((item) => item.id === activeId) ?? layouts[0];
  const selected = layout?.blocks.find((block) => block.id === selectedId) ?? null;

  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node || !layout) return;
    const measure = () => {
      const next = Math.min(1, (node.clientWidth - 64) / layout.canvas.width);
      if (Math.abs(next - scaleRef.current) < 0.01) return;
      scaleRef.current = next;
      setScale(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout, screen]);

  const patchLayout = (recipe: (current: FormLayout) => FormLayout) => {
    if (!layout) return;
    setLayouts((prev) => prev.map((item) => (item.id === layout.id ? recipe(item) : item)));
  };

  const patchBlock = (id: string, recipe: (block: FormBlock) => FormBlock) => {
    patchLayout((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.id === id ? recipe(block) : block)),
    }));
  };

  const addItem = (item: LibraryItem) => {
    if (!layout) return;
    const y = layout.blocks.reduce((max, block) => Math.max(max, block.y + block.h), 8) + 16;
    const created = item.blocks(24, y);
    const bottom = created.reduce((max, block) => Math.max(max, block.y + block.h), y);
    patchLayout((current) => ({
      ...current,
      canvas: { ...current.canvas, height: Math.max(current.canvas.height, bottom + 24) },
      blocks: [...current.blocks, ...created],
    }));
    setSelectedId(created[0]?.id ?? null);
    setDesign(true);
  };

  const startDrag = (block: FormBlock, event: ReactPointerEvent) => {
    if (!design || !layout) return;
    event.preventDefault();
    setSelectedId(block.id);
    const originX = event.clientX;
    const originY = event.clientY;
    const start = { x: block.x, y: block.y };
    const move = (pointer: PointerEvent) => {
      const ratio = scaleRef.current || 1;
      const x = snap(Math.min(Math.max(0, start.x + (pointer.clientX - originX) / ratio), layout.canvas.width - block.w));
      const y = snap(Math.min(Math.max(0, start.y + (pointer.clientY - originY) / ratio), layout.canvas.height - block.h));
      patchBlock(block.id, (current) => ({ ...current, x, y }));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const startResize = (block: FormBlock, event: ReactPointerEvent) => {
    if (!layout) return;
    event.preventDefault();
    const originX = event.clientX;
    const originY = event.clientY;
    const start = { w: block.w, h: block.h };
    const move = (pointer: PointerEvent) => {
      const ratio = scaleRef.current || 1;
      const w = snap(Math.max(140, Math.min(start.w + (pointer.clientX - originX) / ratio, layout.canvas.width - block.x)));
      const h = snap(Math.max(48, Math.min(start.h + (pointer.clientY - originY) / ratio, layout.canvas.height - block.y)));
      patchBlock(block.id, (current) => ({ ...current, w, h }));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  const removeSelected = () => {
    if (!selected) return;
    patchLayout((current) => ({ ...current, blocks: current.blocks.filter((block) => block.id !== selected.id) }));
    setSelectedId(null);
  };

  const resetStarters = () => {
    const next = starterLayouts();
    setLayouts(next);
    setActiveId(next[0].id);
    setSelectedId(null);
  };

  const createEmpty = () => {
    const next = blankLayout();
    setLayouts((prev) => [...prev, next]);
    setActiveId(next.id);
    setSelectedId(null);
    setDesign(true);
  };

  if (!layout) return null;

  return (
    <ThemeProvider theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}>
      <div className="shell">
        <AppBar>
          <AppBarLogo icon={DashboardsIcon} alt="MDM" />
          <AppBarContainer>
            <AppBarItem
              href="#brief"
              variant={screen === 'brief' ? 'primary' : 'secondary'}
              className={screen === 'brief' ? 'nav-current' : undefined}
              onClick={(event) => {
                event.preventDefault();
                setScreen('brief');
              }}
            >
              О продукте
            </AppBarItem>
            {screen === 'work' ? (
              layouts.map((item) => (
                <AppBarItem
                  key={item.id}
                  href={`#${item.id}`}
                  variant={item.id === layout.id ? 'primary' : 'secondary'}
                  className={item.id === layout.id ? 'nav-current' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveId(item.id);
                    setSelectedId(null);
                  }}
                >
                  {item.name}
                </AppBarItem>
              ))
            ) : (
              <AppBarItem
                href="#work"
                variant="secondary"
                onClick={(event) => {
                  event.preventDefault();
                  openWork();
                }}
              >
                Конструктор
              </AppBarItem>
            )}
          </AppBarContainer>
          <div className="shell-tools">
            {screen === 'work' ? (
              <>
                <Button size={BUTTON_SIZE.SMALL} variant={design ? BUTTON_VARIANT.CONTAINED : BUTTON_VARIANT.OUTLINED} onClick={() => setDesign(true)}>
                  Редактирование
                </Button>
                <Button size={BUTTON_SIZE.SMALL} variant={design ? BUTTON_VARIANT.OUTLINED : BUTTON_VARIANT.CONTAINED} onClick={() => { setDesign(false); setSelectedId(null); }}>
                  Просмотр
                </Button>
              </>
            ) : null}
            <Button size={BUTTON_SIZE.SMALL} variant={BUTTON_VARIANT.TEXT} onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </Button>
          </div>
        </AppBar>
        {screen === 'brief' ? <Brief onOpen={openWork} /> : (
        <div className={design ? 'studio' : 'studio is-preview'}>
          {design ? (
            <aside className="studio-side">
              <div className="side-scroll">
                <div>
                  <p className="product-kicker">MDM</p>
                  <p className="product-title">Конструктор форм</p>
                </div>
                <p className="panel-copy">Блок из библиотеки встаёт под макетом. В просмотре форма совпадает с настройкой.</p>
                {libraryGroups.map((group) => (
                  <div key={group} className="library-group">
                    <p className="panel-kicker">{group}</p>
                    {library
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <button key={item.id} type="button" className="palette-item" onClick={() => addItem(item)}>
                          <strong>{item.label}</strong>
                          <span>{item.hint}</span>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
              <div className="side-actions">
                <Button fullWidth variant={BUTTON_VARIANT.TEXT} onClick={createEmpty}>
                  Новая форма
                </Button>
                <Button fullWidth variant={BUTTON_VARIANT.TEXT} onClick={resetStarters}>
                  Сбросить макеты
                </Button>
              </div>
            </aside>
          ) : null}

          <div className="studio-stage" ref={stageRef}>
            {design ? null : <p className="stage-note">{layout.description}</p>}
            <div className="stage-frame" style={{ width: layout.canvas.width * scale, height: layout.canvas.height * scale }}>
              <div
                className={design ? 'studio-canvas is-design' : 'studio-canvas'}
                style={{
                  width: layout.canvas.width,
                  height: layout.canvas.height,
                  backgroundColor: layout.canvas.background,
                  transform: `scale(${scale})`,
                }}
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) setSelectedId(null);
                }}
              >
                {layout.blocks.map((block) => (
                  <BlockView
                    key={block.id}
                    block={block}
                    design={design}
                    selected={block.id === selectedId}
                    onSelect={() => setSelectedId(block.id)}
                    onChangeValue={(value) => patchBlock(block.id, (current) => ({ ...current, value }))}
                    onDragStart={(event) => startDrag(block, event)}
                    onResizeStart={(event) => startResize(block, event)}
                  />
                ))}
              </div>
            </div>
          </div>

          {design ? (
            <aside className="studio-side studio-props">
              {selected ? (
                <Inspector block={selected} onChange={(recipe) => patchBlock(selected.id, recipe)} onDelete={removeSelected} />
              ) : (
                <FormProps layout={layout} onChange={patchLayout} />
              )}
            </aside>
          ) : null}
        </div>
        )}
      </div>
    </ThemeProvider>
  );
}
