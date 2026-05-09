import { TimerPhase, TimerType } from 'ontime-types';
import { IoArrowDown, IoArrowUp, IoBan, IoTime } from 'react-icons/io5';
import { LuArrowDownToLine } from 'react-icons/lu';

import { CornerWithPip } from '../../../common/components/editor-utils/EditorUtils';
import Tooltip from '../../../common/components/tooltip/Tooltip';
import useViewSettings from '../../../common/hooks-query/useViewSettings';
import { useMessagePreview } from '../../../common/hooks/useSocket';
import { handleLinks } from '../../../common/utils/linkUtils';
import { cx, timerPlaceholder } from '../../../common/utils/styleUtils';
import { useTranslation } from '../../../translation/TranslationProvider';
import PipRoot from '../../../views/editor/pip-timer/PipRoot';

import style from './TimerPreview.module.scss';

import { TranslationObject } from 'ontime-types';

const secondarySourceLabels: Record<string, keyof TranslationObject> = {
  aux1: 'control.message.preview.aux1',
  aux2: 'control.message.preview.aux2',
  aux3: 'control.message.preview.aux3',
  secondary: 'control.message.preview.secondary',
};

export default function TimerPreview() {
  const { blink, blackout, countToEnd, phase, secondarySource, showTimerMessage, timerType } = useMessagePreview();
  const { data } = useViewSettings();
  const { getLocalizedString } = useTranslation();

  const main = (() => {
    if (showTimerMessage) return getLocalizedString('control.message.preview.message');
    if (timerType === TimerType.None) return timerPlaceholder;
    if (phase === TimerPhase.Pending) return getLocalizedString('control.message.preview.standby');
    if (phase === TimerPhase.Overtime) return getLocalizedString('control.message.preview.overtime');
    if (timerType === TimerType.Clock) return getLocalizedString('control.message.preview.clock');
    if (countToEnd) return getLocalizedString('control.message.preview.count_to_end');
    return getLocalizedString('control.message.preview.timer');
  })();

  const secondary = (() => {
    // message is a fullscreen overlay or secondary is not active
    if (showTimerMessage || !secondarySource) return null;

    // we need to check aux first since it takes priority
    return getLocalizedString(secondarySourceLabels[secondarySource]);
  })();

  const overrideColour = (() => {
    // override fallback colours from starter project
    if (phase === TimerPhase.Warning) return data.warningColor ?? '#ffa528';
    if (phase === TimerPhase.Danger) return data.dangerColor ?? '#ff7300';
    return data.normalColor ?? '#FFFC';
  })();

  const showColourOverride = main == 'Timer';
  const contentClasses = cx([blink && style.blink, blackout && style.blackout]);

  return (
    <div className={style.preview}>
      <CornerWithPip onExtractClick={(event) => handleLinks('timer', event)} pipElement={<PipRoot />} />
      <div className={contentClasses}>
        <div
          className={style.mainContent}
          data-phase={showColourOverride && phase}
          style={showColourOverride ? { '--override-colour': overrideColour } : {}}
        >
          {main}
        </div>
        {secondary !== null && <div className={style.secondaryContent}>{secondary}</div>}
      </div>
      <div className={style.eventStatus}>
        <Tooltip
          text={getLocalizedString('control.message.preview.type_countdown')}
          render={<span />}
          className={style.statusIcon}
          data-active={timerType === TimerType.CountDown}
        >
          <IoArrowDown />
        </Tooltip>
        <Tooltip
          text={getLocalizedString('control.message.preview.type_countup')}
          render={<span />}
          className={style.statusIcon}
          data-active={timerType === TimerType.CountUp}
        >
          <IoArrowUp />
        </Tooltip>
        <Tooltip
          text={getLocalizedString('control.message.preview.type_clock')}
          render={<span />}
          className={style.statusIcon}
          data-active={timerType === TimerType.Clock}
        >
          <IoTime />
        </Tooltip>
        <Tooltip
          text={getLocalizedString('control.message.preview.type_none')}
          render={<span />}
          className={style.statusIcon}
          data-active={timerType === TimerType.None}
        >
          <IoBan />
        </Tooltip>
        <Tooltip
          text={countToEnd ? getLocalizedString('control.message.preview.count_to_end') : getLocalizedString('control.message.preview.count_duration')}
          render={<span />}
          className={style.statusIcon}
          data-active={countToEnd}
        >
          <LuArrowDownToLine />
        </Tooltip>
      </div>
    </div>
  );
}
