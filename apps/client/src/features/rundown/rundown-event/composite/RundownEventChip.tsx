import { Day } from 'ontime-types';
import { MILLIS_PER_MINUTE, MILLIS_PER_SECOND, isPlaybackActive, millisToString } from 'ontime-utils';
import { useMemo } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

import Tooltip from '../../../../common/components/tooltip/Tooltip';
import useReport from '../../../../common/hooks-query/useReport';
import { usePlayback } from '../../../../common/hooks/useSocket';
import { cx } from '../../../../common/utils/styleUtils';
import { formatDuration, useTimeUntilExpectedStart } from '../../../../common/utils/time';
import { useTranslation } from '../../../../translation/useTranslation';

import style from './RundownEventChip.module.scss';

interface RundownEventChipProps {
  id: string;
  timeStart: number;
  delay: number;
  dayOffset: Day;
  isPast: boolean;
  isLoaded: boolean;
  className: string;
  totalGap: number;
  duration: number;
  isLinkedToLoaded: boolean;
}

export default function RundownEventChip({
  timeStart,
  delay,
  dayOffset,
  isPast,
  isLoaded,
  className,
  totalGap,
  id,
  duration,
  isLinkedToLoaded,
}: RundownEventChipProps) {
  const playback = usePlayback();

  if (isLoaded) {
    return null;
  }

  const playbackActive = isPlaybackActive(playback);

  if (!playbackActive || isPast) {
    return <EventReport className={className} id={id} duration={duration} />;
  }

  if (playbackActive) {
    const { getLocalizedString } = useTranslation();
    // we extracted the component to avoid unnecessary calculations and re-renders
    return (
      <Tooltip
        text={getLocalizedString('rundown.editor.expected_time_until_start')}
        render={<span />}
        className={className}
      >
        <EventUntil
          timeStart={timeStart}
          delay={delay}
          dayOffset={dayOffset}
          totalGap={totalGap}
          isLinkedToLoaded={isLinkedToLoaded}
        />
      </Tooltip>
    );
  }

  return null;
}

interface EventUntilProps {
  timeStart: number;
  delay: number;
  dayOffset: Day;
  totalGap: number;
  isLinkedToLoaded: boolean;
}

function EventUntil({ timeStart, delay, dayOffset, totalGap, isLinkedToLoaded }: EventUntilProps) {
  const { getLocalizedString } = useTranslation();
  const timeUntil = useTimeUntilExpectedStart({ timeStart, delay, dayOffset }, { totalGap, isLinkedToLoaded });
  const isDue = timeUntil < MILLIS_PER_SECOND;

  const timeUntilString = isDue
    ? getLocalizedString('rundown.editor.due')
    : `${formatDuration(Math.abs(timeUntil), timeUntil > 2 * MILLIS_PER_MINUTE)}`;

  return <div className={cx([style.chip, isDue && style.due])}>{timeUntilString}</div>;
}

interface EventReportProps {
  className: string;
  id: string;
  duration: number;
}

function EventReport(props: EventReportProps) {
  const { getLocalizedString } = useTranslation();
  const { className, id, duration } = props;
  const { data } = useReport();
  const currentReport = data[id];

  const [value, overUnderStyle, tooltip] = useMemo(() => {
    if (!currentReport) {
      return [null, 'none', ''];
    }

    const { startedAt, endedAt } = currentReport;
    if (!startedAt || !endedAt) {
      return [null, 'none', ''];
    }

    const actualDuration = endedAt - startedAt;
    const difference = actualDuration - duration;
    const absDifference = Math.abs(difference);

    if (absDifference < MILLIS_PER_SECOND) {
      return ['ontime', 'under', getLocalizedString('rundown.editor.event_finished_on_time')];
    }

    const isOver = difference > 0;

    const fullTimeValue = millisToString(absDifference);

    const tooltip = isOver
      ? getLocalizedString('rundown.editor.event_ran_over').replace('{{0}}', fullTimeValue)
      : getLocalizedString('rundown.editor.event_ran_under').replace('{{0}}', fullTimeValue);

    const value = `${isOver ? '+' : '-'}${formatDuration(absDifference, absDifference > 2 * MILLIS_PER_MINUTE)}`;
    return [value, isOver ? 'over' : 'under', tooltip];
  }, [currentReport, duration, getLocalizedString]);

  if (!value) {
    return null;
  }

  return (
    <Tooltip text={tooltip} render={<span />} className={cx([style.chip, style[overUnderStyle], className])}>
      {value === 'ontime' ? <IoCheckmarkCircle size='1.1rem' /> : value}
    </Tooltip>
  );
}
