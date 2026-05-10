import { TranslationObject } from 'ontime-types';

export const navigatorConstants: { url: string; translationKey: keyof TranslationObject }[] = [
  { url: 'timer', translationKey: 'navigation.timer' },
  { url: 'backstage', translationKey: 'navigation.backstage' },
  { url: 'timeline', translationKey: 'navigation.timeline' },
  { url: 'studio', translationKey: 'navigation.studio' },
  { url: 'countdown', translationKey: 'navigation.countdown' },
  { url: 'info', translationKey: 'navigation.info' },
];

// default time format to use for users in 12 hour clocks
export const FORMAT_12 = 'h:mm:ss a';
// default time format to use for users in 24 hour clocks
export const FORMAT_24 = 'HH:mm:ss';
