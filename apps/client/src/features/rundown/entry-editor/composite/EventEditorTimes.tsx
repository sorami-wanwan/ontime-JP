import { EndAction, TimeStrategy, TimerType } from 'ontime-types';
import { parseUserTime } from 'ontime-utils';
import { memo } from 'react';
import { IoInformationCircle } from 'react-icons/io5';

import * as Editor from '../../../../common/components/editor-utils/EditorUtils';
import TimeInput from '../../../../common/components/input/time-input/TimeInput';
import Select from '../../../../common/components/select/Select';
import Switch from '../../../../common/components/switch/Switch';
import Tooltip from '../../../../common/components/tooltip/Tooltip';
import { useEntryActionsContext } from '../../../../common/context/EntryActionsContext';
import { millisToDelayString } from '../../../../common/utils/dateConfig';
import { formatTime } from '../../../../common/utils/time';
import { useTranslation } from '../../../../translation/useTranslation';
import TimeInputFlow from '../../time-input-flow/TimeInputFlow';

import style from '../EntryEditor.module.scss';

interface EventEditorTimesProps {
  eventId: string;
  timeStart: number;
  timeEnd: number;
  duration: number;
  timeStrategy: TimeStrategy;
  linkStart: boolean;
  countToEnd: boolean;
  delay: number;
  endAction: EndAction;
  timerType: TimerType;
  timeWarning: number;
  timeDanger: number;
}

type HandledActions = 'countToEnd' | 'timerType' | 'endAction' | 'timeWarning' | 'timeDanger';

export default memo(EventEditorTimes);
function EventEditorTimes({
  eventId,
  timeStart,
  timeEnd,
  duration,
  timeStrategy,
  linkStart,
  countToEnd,
  delay,
  endAction,
  timerType,
  timeWarning,
  timeDanger,
}: EventEditorTimesProps) {
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  const handleSubmit = (field: HandledActions, value: string | boolean) => {
    if (field === 'countToEnd') {
      updateEntry({ id: eventId, countToEnd: value as boolean });
      return;
    }

    if (field === 'timeWarning' || field === 'timeDanger') {
      const newTime = parseUserTime(value as string);
      updateEntry({ id: eventId, [field]: newTime });
      return;
    }

    if (field === 'timerType' || field === 'endAction') {
      updateEntry({ id: eventId, [field]: value });
      return;
    }
  };

  const hasDelay = delay !== 0;
  const delayLabel = hasDelay
    ? getLocalizedString('rundown.editor.delay_label_expanded')
        .replace('{{0}}', millisToDelayString(delay, 'expanded'))
        .replace('{{1}}', formatTime(timeStart + delay))
        .replace('{{2}}', formatTime(timeEnd + delay))
    : '';

  return (
    <>
      <div className={style.column}>
        <Editor.Title>{getLocalizedString('rundown.editor.event_schedule')}</Editor.Title>
        <div>
          <div className={style.inline}>
            <TimeInputFlow
              eventId={eventId}
              timeStart={timeStart}
              timeEnd={timeEnd}
              duration={duration}
              timeStrategy={timeStrategy}
              linkStart={linkStart}
              delay={delay}
              countToEnd={countToEnd}
              showLabels
            />
          </div>
          <div className={style.delayLabel}>{delayLabel}</div>
        </div>
      </div>

      <div className={style.column}>
        <Editor.Title>{getLocalizedString('rundown.editor.event_behaviour')}</Editor.Title>
        <div className={style.splitTwo}>
          <div>
            <Editor.Label htmlFor='endAction'>{getLocalizedString('rundown.editor.end_action')}</Editor.Label>
            <Select
              value={endAction}
              onValueChange={(value: EndAction | null) => {
                if (value === null) return;
                handleSubmit('endAction', value);
              }}
              options={[
                { value: EndAction.None, label: getLocalizedString('rundown.editor.end_action_none') },
                { value: EndAction.LoadNext, label: getLocalizedString('rundown.editor.end_action_load_next') },
                { value: EndAction.PlayNext, label: getLocalizedString('rundown.editor.end_action_play_next') },
              ]}
            />
          </div>
          <div>
            <Editor.Label htmlFor='countToEnd'>{getLocalizedString('rundown.editor.count_to_end')}</Editor.Label>
            <Editor.Label className={style.switchLabel}>
              <Switch
                id='countToEnd'
                checked={countToEnd}
                onCheckedChange={(value) => handleSubmit('countToEnd', value)}
              />
              {countToEnd ? getLocalizedString('common.on') : getLocalizedString('common.off')}
            </Editor.Label>
          </div>
        </div>
      </div>

      <div className={style.column}>
        <Editor.Title>
          <Tooltip text={getLocalizedString('rundown.editor.display_options_tooltip')} render={<span />}>
            {getLocalizedString('rundown.editor.display_options')}
            <IoInformationCircle className={style.tooltipIcon} />
          </Tooltip>
        </Editor.Title>
        <div className={style.splitTwo}>
          <div>
            <Editor.Label htmlFor='timerType'>{getLocalizedString('rundown.editor.timer_type')}</Editor.Label>
            <Select
              value={timerType}
              onValueChange={(value: TimerType | null) => {
                if (value === null) return;
                handleSubmit('timerType', value);
              }}
              options={[
                { value: TimerType.CountDown, label: getLocalizedString('rundown.editor.timer_type_count_down') },
                { value: TimerType.CountUp, label: getLocalizedString('rundown.editor.timer_type_count_up') },
                { value: TimerType.Clock, label: getLocalizedString('rundown.editor.timer_type_clock') },
                { value: TimerType.None, label: getLocalizedString('rundown.editor.timer_type_none') },
              ]}
            />
          </div>

          <div className={style.inline}>
            <div>
              <Editor.Label htmlFor='timeWarning'>{getLocalizedString('rundown.editor.warning_time')}</Editor.Label>
              <TimeInput
                id='timeWarning'
                name='timeWarning'
                submitHandler={handleSubmit}
                time={timeWarning}
                placeholder={getLocalizedString('common.duration')}
              />
            </div>
            <div>
              <Editor.Label htmlFor='timeDanger'>{getLocalizedString('rundown.editor.danger_time')}</Editor.Label>
              <TimeInput
                id='timeDanger'
                name='timeDanger'
                submitHandler={handleSubmit}
                time={timeDanger}
                placeholder={getLocalizedString('common.duration')}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
