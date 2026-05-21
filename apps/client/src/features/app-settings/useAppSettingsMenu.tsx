import { TranslationObject } from 'ontime-types';
import { useMemo } from 'react';

import useAppVersion from '../../common/hooks-query/useAppVersion';
import { isDocker } from '../../externals';
import { useTranslation } from '../../translation/useTranslation';

export type SettingsOption = {
  id: string;
  labelKey: keyof TranslationObject;
  secondary?: Readonly<SettingsOption[]>;
  split?: boolean;
  highlight?: string;
};

const staticOptions = [
  {
    id: 'settings',
    labelKey: 'settings.title',
    secondary: [
      { id: 'settings__data', labelKey: 'settings.menu.project_data' },
      { id: 'settings__general', labelKey: 'settings.menu.general_settings' },
      { id: 'settings__view', labelKey: 'settings.menu.view_settings' },
      { id: 'settings__custom-views', labelKey: 'settings.menu.custom_views' },
      { id: 'settings__port', labelKey: 'settings.menu.server_port' },
    ],
  },
  {
    id: 'project',
    labelKey: 'settings.menu.project',
    split: true,
    secondary: [
      { id: 'project__create', labelKey: 'settings.menu.create' },
      { id: 'project__list', labelKey: 'settings.menu.manage_projects' },
    ],
  },
  {
    id: 'manage',
    labelKey: 'settings.menu.manage',
    secondary: [
      { id: 'manage__defaults', labelKey: 'settings.menu.rundown_defaults' },
      { id: 'manage__custom', labelKey: 'settings.menu.custom_fields' },
      { id: 'manage__rundowns', labelKey: 'settings.menu.manage_rundowns' },
      { id: 'manage__sheets', labelKey: 'settings.menu.import_spreadsheet' },
      { id: 'manage__sheets', labelKey: 'settings.menu.sync_google_sheet' },
    ],
  },
  {
    id: 'automation',
    labelKey: 'settings.menu.automation',
    split: true,
    secondary: [
      { id: 'automation__settings', labelKey: 'settings.menu.automation_settings' },
      { id: 'automation__automations', labelKey: 'settings.menu.manage_automations' },
      { id: 'automation__triggers', labelKey: 'settings.menu.manage_triggers' },
    ],
  },
  {
    id: 'sharing',
    labelKey: 'settings.menu.sharing',
    split: true,
    secondary: [
      { id: 'sharing__presets', labelKey: 'settings.menu.url_presets' },
      {
        id: 'sharing__link',
        labelKey: 'settings.menu.share_link',
      },
      { id: 'sharing__report', labelKey: 'settings.menu.runtime_report' },
    ],
  },
  {
    id: 'network',
    labelKey: 'settings.menu.network',
    split: true,
    secondary: [
      {
        id: 'network__log',
        labelKey: 'settings.menu.event_log',
      },
      {
        id: 'network__clients',
        labelKey: 'settings.menu.manage_clients',
      },
    ],
  },
  {
    id: 'about',
    labelKey: 'settings.menu.about',
    split: true,
  },
  {
    id: 'shutdown',
    labelKey: 'settings.menu.shutdown',
    split: true,
  },
] as const;

// a child of navigation or a child of secondary navigation
export type SettingsOptionId =
  | (typeof staticOptions)[number]['id']
  | Extract<(typeof staticOptions)[number], { secondary: object }>['secondary'][number]['id'];

export function useAppSettingsMenu() {
  const { data } = useAppVersion();
  const { getLocalizedString } = useTranslation();

  const options = useMemo(
    () =>
      staticOptions.map((option) => ({
        ...option,
        label: getLocalizedString(option.labelKey as any),
        // if we are in docker don't show the port option
        secondary:
          'secondary' in option
            ? isDocker && option.id === 'settings'
              ? option.secondary
                  .filter(({ id }) => id !== 'settings__port')
                  .map((sec) => ({ ...sec, label: getLocalizedString(sec.labelKey as any) }))
              : option.secondary.map((sec) => ({ ...sec, label: getLocalizedString(sec.labelKey as any) }))
            : undefined,
        // if there is an update then highlight the about setting
        highlight:
          option.id === 'about' && data.hasUpdates ? getLocalizedString('settings.menu.new_version') : undefined,
      })),
    [data, getLocalizedString],
  );

  return { options };
}
