import { millisToString, removeTrailingZero } from 'ontime-utils';

import { formatDuration } from '../../../common/utils/time';
import { TranslationKey } from '../../../translation/TranslationProvider';

export function formatDelay(
  timeStart: number,
  delay: number,
  getLocalizedString: (key: TranslationKey) => string,
): string | undefined {
  if (!delay) return;

  const delayedStart = Math.max(0, timeStart + delay);

  const timeTag = removeTrailingZero(millisToString(delayedStart));
  return getLocalizedString('rundown.editor.new_start').replace('{{0}}', timeTag);
}
export function formatGap(gap: number, isNextDay: boolean, getLocalizedString: (key: TranslationKey) => string) {
  if (gap === 0) {
    if (isNextDay) {
      // We show a next day warning even if there is no gap
      return getLocalizedString('rundown.editor.next_day');
    }
    return;
  }

  const gapString = formatDuration(Math.abs(gap), false);
  const typeString = gap < 0 ? getLocalizedString('rundown.editor.overlap') : getLocalizedString('rundown.editor.gap');
  return `${typeString} ${gapString}${isNextDay ? ` ${getLocalizedString('rundown.editor.next_day')}` : ''}`;
}
