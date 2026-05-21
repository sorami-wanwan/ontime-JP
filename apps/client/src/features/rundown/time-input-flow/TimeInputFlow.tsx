import { TimeField, TimeStrategy } from 'ontime-types';
import { dayInMs } from 'ontime-utils';
import { memo } from 'react';
import { IoAlertCircleOutline, IoLink, IoLockClosed, IoLockOpenOutline, IoUnlink } from 'react-icons/io5';

import IconButton from '../../../common/components/buttons/IconButton';
import * as Editor from '../../../common/components/editor-utils/EditorUtils';
import TimeInput from '../../../common/components/input/time-input/TimeInput';
import Tooltip from '../../../common/components/tooltip/Tooltip';
import { useEntryActionsContext } from '../../../common/context/EntryActionsContext';
import { useTranslation } from '../../../translation/useTranslation';
import TimeInputGroup from './TimeInputGroup';

import style from './TimeInputFlow.module.scss';

interface TimeInputFlowProps {
  eventId: string;
  countToEnd: boolean;
  timeStart: number;
  timeEnd: number;
  duration: number;
  timeStrategy: TimeStrategy;
  linkStart: boolean;
  delay: number;
  showLabels?: boolean;
}

export default memo(TimeInputFlow);
function TimeInputFlow({
  eventId,
  countToEnd,
  timeStart,
  timeEnd,
  duration,
  timeStrategy,
  linkStart,
  delay,
  showLabels,
}: TimeInputFlowProps) {
  const { updateEntry, updateTimer } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  // In sync with EventEditorTimes
  const handleSubmit = (field: TimeField, value: string) => {
    updateTimer(eventId, field, value);
  };

  const handleChangeStrategy = (timeStrategy: TimeStrategy) => {
    updateEntry({ id: eventId, timeStrategy });
  };

  const handleLink = (doLink: boolean) => {
    updateEntry({ id: eventId, linkStart: doLink });
  };

  const warnings = [];
  if (timeStart + duration > dayInMs) {
    warnings.push(getLocalizedString('rundown.editor.over_midnight'));
  }

  if (countToEnd) {
    warnings.push(getLocalizedString('rundown.editor.count_to_end'));
  }

  const hasDelay = delay !== 0;
  const isLockedEnd = timeStrategy === TimeStrategy.LockEnd;
  const isLockedDuration = timeStrategy === TimeStrategy.LockDuration;

  return (
    <>
      <div className={style.inputWrapper}>
        {showLabels && (
          <Editor.Label className={style.sectionTitle}>{getLocalizedString('rundown.editor.start_time')}</Editor.Label>
        )}
        <Editor.Label className={style.hoverLabel}>{getLocalizedString('common.start')}</Editor.Label>
        <TimeInputGroup hasDelay={hasDelay}>
          <TimeInput
            name='timeStart'
            submitHandler={handleSubmit}
            time={timeStart}
            placeholder={getLocalizedString('common.start')}
            align='left'
            disabled={linkStart}
            shouldFormat
          />
          <Tooltip
            text={getLocalizedString('rundown.editor.link_start')}
            onClick={() => handleLink(!linkStart)}
            render={<IconButton variant='subtle-white' className={linkStart ? style.active : style.inactive} />}
            data-testid='lock__start'
          >
            <span className={style.fourtyfive}>{linkStart ? <IoLink /> : <IoUnlink />}</span>
          </Tooltip>
        </TimeInputGroup>
      </div>

      <div className={style.inputWrapper}>
        {showLabels && <Editor.Label>{getLocalizedString('rundown.editor.end_time')}</Editor.Label>}
        <Editor.Label className={style.hoverLabel}>{getLocalizedString('common.end')}</Editor.Label>
        <TimeInputGroup hasDelay={hasDelay}>
          <TimeInput
            name='timeEnd'
            submitHandler={handleSubmit}
            time={timeEnd}
            placeholder={getLocalizedString('common.end')}
            align='left'
            disabled={isLockedDuration}
            shouldFormat
          />
          <Tooltip
            text={getLocalizedString('rundown.editor.lock_end')}
            render={<IconButton variant='subtle-white' className={isLockedEnd ? style.active : style.inactive} />}
            onClick={() => handleChangeStrategy(TimeStrategy.LockEnd)}
            data-testid='lock__end'
          >
            {isLockedEnd ? <IoLockClosed /> : <IoLockOpenOutline />}
          </Tooltip>
        </TimeInputGroup>
      </div>

      <div className={style.inputWrapper}>
        {showLabels && <Editor.Label>{getLocalizedString('common.duration')}</Editor.Label>}
        <Editor.Label className={style.hoverLabel}>{getLocalizedString('common.duration')}</Editor.Label>
        <TimeInputGroup hasDelay={hasDelay}>
          <TimeInput
            name='duration'
            submitHandler={handleSubmit}
            time={duration}
            placeholder={getLocalizedString('common.duration')}
            align='left'
            disabled={isLockedEnd}
          />
          <Tooltip
            text={getLocalizedString('rundown.editor.lock_duration')}
            render={<IconButton variant='subtle-white' className={isLockedDuration ? style.active : style.inactive} />}
            onClick={() => handleChangeStrategy(TimeStrategy.LockDuration)}
            data-testid='lock__duration'
          >
            {isLockedDuration ? <IoLockClosed /> : <IoLockOpenOutline />}
          </Tooltip>
        </TimeInputGroup>
      </div>

      {warnings.length > 0 && (
        <Tooltip text={warnings.join(' - ')} className={style.timerNote} data-testid='event-warning' render={<span />}>
          <IoAlertCircleOutline />
        </Tooltip>
      )}
    </>
  );
}
