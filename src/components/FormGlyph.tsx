import type { FC } from 'react';
import {
  ChartBarIcon,
  CubesIcon,
  FinIndicatorsIcon,
  TransportIcon,
  UsersIcon,
  type IconComponentProps,
} from 'ui-kit';
import type { AnalyticForm } from '../types';

const icons: Record<AnalyticForm['icon'], FC<IconComponentProps>> = {
  sales: ChartBarIcon,
  production: CubesIcon,
  finance: FinIndicatorsIcon,
  people: UsersIcon,
  logistics: TransportIcon,
};

export function FormGlyph({ icon, color }: { icon: AnalyticForm['icon']; color?: IconComponentProps['color'] }) {
  const Glyph = icons[icon];
  return <Glyph color={color} />;
}
