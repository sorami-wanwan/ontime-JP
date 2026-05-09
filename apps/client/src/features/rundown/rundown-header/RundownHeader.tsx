import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@base-ui/react/toolbar';
import { OffsetMode } from 'ontime-types';
import { memo } from 'react';

import Tooltip from '../../../common/components/tooltip/Tooltip';
import { setOffsetMode, useOffsetMode } from '../../../common/hooks/useSocket';
import { AppMode } from '../../../ontimeConfig';
import { useTranslation } from '../../../translation/useTranslation';
import { EditorLayoutMode, useEditorLayout } from '../../../views/editor/useEditorLayout';
import { RundownViewMode } from '../rundown.options';
import { useEditorFollowMode } from '../useEditorFollowMode';
import RundownMenu from './RundownMenu';

import style from './RundownHeader.module.scss';

interface RundownHeaderProps {
  isExtracted?: boolean;
  viewMode: RundownViewMode;
  setViewMode: (mode: RundownViewMode) => void;
}

interface HeaderControlsConfig {
  showRunEditToggle: boolean;
  showOffsetToggle: boolean;
  showOverflowMenu: boolean;
}

export const HEADER_CONTROLS_CONFIG: Record<EditorLayoutMode, HeaderControlsConfig> = {
  [EditorLayoutMode.CONTROL]: {
    showRunEditToggle: true,
    showOffsetToggle: true,
    showOverflowMenu: true,
  },
  [EditorLayoutMode.PLANNING]: {
    showRunEditToggle: false,
    showOffsetToggle: false,
    showOverflowMenu: true,
  },
  [EditorLayoutMode.TRACKING]: {
    showRunEditToggle: false,
    showOffsetToggle: true,
    showOverflowMenu: false,
  },
} as const;

export default memo(RundownHeader);
function RundownHeader({ isExtracted, viewMode, setViewMode }: RundownHeaderProps) {
  const { editorMode, setEditorMode } = useEditorFollowMode();
  const offsetMode = useOffsetMode();
  const { layoutMode } = useEditorLayout();
  const { getLocalizedString } = useTranslation();

  const { showRunEditToggle, showOffsetToggle, showOverflowMenu } = HEADER_CONTROLS_CONFIG[layoutMode];

  const toggleAppMode = (mode: AppMode[]) => {
    // we need to stop user from deselecting a mode
    const newValue = mode.at(0);
    if (!newValue) return;
    setEditorMode(newValue);
  };

  const toggleViewMode = (mode: RundownViewMode[]) => {
    const newValue = mode.at(0);
    if (!newValue) return;
    setViewMode(newValue);
  };

  const toggleOffsetMode = (mode: OffsetMode[]) => {
    const newValue = mode.at(0);
    if (!newValue) return;
    setOffsetMode(newValue);
  };

  return (
    <Toolbar.Root className={style.header}>
      {showRunEditToggle && (
        <ToggleGroup value={[editorMode]} onValueChange={toggleAppMode} className={style.group}>
          <Tooltip
            text={getLocalizedString('rundown.header.run_tooltip')}
            render={<Toolbar.Button render={<Toggle />} value={AppMode.Run} className={style.radioButton} />}
          >
            {getLocalizedString('rundown.header.run')}
          </Tooltip>
          <Tooltip
            text={getLocalizedString('rundown.header.edit_tooltip')}
            render={<Toolbar.Button render={<Toggle />} value={AppMode.Edit} className={style.radioButton} />}
          >
            {getLocalizedString('rundown.header.edit')}
          </Tooltip>
        </ToggleGroup>
      )}

      <ToggleGroup value={[viewMode]} onValueChange={toggleViewMode} className={style.group}>
        <Tooltip
          text={getLocalizedString('rundown.header.list_tooltip')}
          render={<Toolbar.Button render={<Toggle />} value={RundownViewMode.List} className={style.radioButton} />}
        >
          {getLocalizedString('rundown.header.list')}
        </Tooltip>
        <Tooltip
          text={getLocalizedString('rundown.header.table_tooltip')}
          render={<Toolbar.Button render={<Toggle />} value={RundownViewMode.Table} className={style.radioButton} />}
        >
          {getLocalizedString('rundown.header.table')}
        </Tooltip>
      </ToggleGroup>

      {showOffsetToggle && (
        <ToggleGroup value={[offsetMode]} onValueChange={toggleOffsetMode} className={style.group}>
          <Tooltip
            text={getLocalizedString('rundown.header.absolute_tooltip')}
            render={<Toolbar.Button render={<Toggle />} value={OffsetMode.Absolute} className={style.radioButton} />}
          >
            {getLocalizedString('rundown.header.absolute')}
          </Tooltip>
          <Tooltip
            text={getLocalizedString('rundown.header.relative_tooltip')}
            render={<Toolbar.Button render={<Toggle />} value={OffsetMode.Relative} className={style.radioButton} />}
          >
            {getLocalizedString('rundown.header.relative')}
          </Tooltip>
        </ToggleGroup>
      )}

      {showOverflowMenu && <RundownMenu allowNavigation={!isExtracted} />}
    </Toolbar.Root>
  );
}
