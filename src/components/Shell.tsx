import type { ReactNode } from 'react';
import {
  AppBar,
  AppBarContainer,
  AppBarItem,
  AppBarLogo,
  BUTTON_VARIANT,
  CatalogIcon,
  DashboardIcon,
  DashboardsIcon,
  Dropdown,
  HistoryIcon,
  SettingIcon,
} from 'ui-kit';
import type { Route, ThemeName } from '../types';

const themeLabel: Record<ThemeName, string> = {
  dark: 'Тёмная',
  light: 'Светлая',
  galaxy: 'Galaxy',
};

type ShellProps = {
  route: Route;
  theme: ThemeName;
  reportsCount: number;
  onTheme: (theme: ThemeName) => void;
  children: ReactNode;
};

function openHash(hash: string) {
  return (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (window.location.hash !== hash) window.location.hash = hash;
  };
}

export function Shell({ route, theme, reportsCount, onTheme, children }: ShellProps) {
  const formsActive = route.name === 'catalog' || route.name === 'form';
  return (
    <div className="shell">
      <AppBar className="shell-bar">
        <AppBarLogo icon={DashboardsIcon} alt="BI Studio" onClick={() => { window.location.hash = '#/'; }} />
        <AppBarContainer>
          <AppBarItem
            href="#/"
            icon={DashboardIcon}
            variant={route.name === 'overview' ? 'primary' : 'secondary'}
            className={route.name === 'overview' ? 'nav-current' : undefined}
            onClick={openHash('#/')}
          >
            Обзор
          </AppBarItem>
          <AppBarItem
            href="#/catalog"
            icon={CatalogIcon}
            variant={formsActive ? 'primary' : 'secondary'}
            className={formsActive ? 'nav-current' : undefined}
            onClick={openHash('#/catalog')}
          >
            Формы
          </AppBarItem>
          <AppBarItem
            href="#/reports"
            icon={HistoryIcon}
            variant={route.name === 'reports' ? 'primary' : 'secondary'}
            className={route.name === 'reports' ? 'nav-current' : undefined}
            onClick={openHash('#/reports')}
          >
            {reportsCount > 0 ? `Снимки ${reportsCount}` : 'Снимки'}
          </AppBarItem>
        </AppBarContainer>
        <div className="shell-tools">
          <Dropdown
            leftIcon={SettingIcon}
            variant={BUTTON_VARIANT.TEXT}
            options={[
              { label: 'Тёмная', onClick: () => onTheme('dark') },
              { label: 'Светлая', onClick: () => onTheme('light') },
              { label: 'Galaxy', onClick: () => onTheme('galaxy') },
            ]}
          >
            {themeLabel[theme]}
          </Dropdown>
        </div>
      </AppBar>
      <main className="shell-main">{children}</main>
    </div>
  );
}
