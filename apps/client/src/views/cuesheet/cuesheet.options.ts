import { CustomFields } from 'ontime-types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OptionValues = {
  hideTableSeconds: boolean;
  hideIndexColumn: boolean;
  showDelayedTimes: boolean;
  hideDelays: boolean;
};

const defaultOptions: OptionValues = {
  hideTableSeconds: false,
  hideIndexColumn: false,
  showDelayedTimes: false,
  hideDelays: false,
};

export type CuesheetOptionKeys = keyof OptionValues;

export interface CuesheetOptions extends OptionValues {
  setOption: <K extends CuesheetOptionKeys>(key: K, value: OptionValues[K]) => void;
  toggleOption: (key: CuesheetOptionKeys) => void;
  resetOptions: () => void;
}

export const usePersistedCuesheetOptions = create<CuesheetOptions>()(
  persist(
    (set) => {
      return {
        ...defaultOptions,
        setOption: (key, value) => set((state) => ({ ...state, [key]: value })),
        toggleOption: (key) => set((state) => ({ ...state, [key]: !state[key] })),
        resetOptions: () => set(defaultOptions),
      };
    },
    {
      name: 'cuesheet-options',
    },
  ),
);

export const cuesheetDefaultColumns = [
  { value: 'flag', label: 'Flag', labelKey: 'common.flag' as const },
  { value: 'cue', label: 'Cue', labelKey: 'common.cue' as const },
  { value: 'title', label: 'Title', labelKey: 'common.title' as const },
  { value: 'timeStart', label: 'Time start', labelKey: 'common.time_start' as const },
  { value: 'timeEnd', label: 'Time end', labelKey: 'common.time_end' as const },
  { value: 'duration', label: 'Duration', labelKey: 'common.duration' as const },
  { value: 'note', label: 'Note', labelKey: 'common.note' as const },
];

export function makeCuesheetCustomColumns(customFields: CustomFields) {
  return Object.entries(customFields).map(([key, field]) => {
    return {
      value: `custom-${key}`,
      label: field.label,
    };
  });
}
