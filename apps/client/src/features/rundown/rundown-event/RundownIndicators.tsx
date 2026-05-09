import { useTranslation } from '../../../translation/useTranslation';
import { formatDelay, formatGap } from './rundownEvent.utils';

import style from './RundownIndicators.module.scss';

interface RundownIndicatorProps {
  timeStart: number;
  isNextDay: boolean;
  delay: number;
  gap: number;
}

export default function RundownIndicators({ timeStart, delay, gap, isNextDay }: RundownIndicatorProps) {
  const { getLocalizedString } = useTranslation();
  const hasGap = formatGap(gap, isNextDay, getLocalizedString);
  const hasDelay = formatDelay(timeStart, delay, getLocalizedString);

  return (
    <div className={style.indicators}>
      {hasDelay && <div className={style.delay}>{hasDelay}</div>}
      {hasGap && <div className={style.gap}>{hasGap}</div>}
    </div>
  );
}
