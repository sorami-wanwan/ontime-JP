import { Toolbar } from '@base-ui/react/toolbar';
import { useDisclosure } from '@mantine/hooks';
import { memo, useCallback } from 'react';
import { IoEllipsisHorizontal, IoList, IoTrash } from 'react-icons/io5';

import Button from '../../../common/components/buttons/Button';
import IconButton from '../../../common/components/buttons/IconButton';
import Dialog from '../../../common/components/dialog/Dialog';
import { DropdownMenu } from '../../../common/components/dropdown-menu/DropdownMenu';
import { useEntryActionsContext } from '../../../common/context/EntryActionsContext';
import { useTranslation } from '../../../translation/useTranslation';
import useAppSettingsNavigation from '../../app-settings/useAppSettingsNavigation';
import { useEventSelection } from '../useEventSelection';

import style from './RundownHeader.module.scss';

interface RundownMenuProps {
  allowNavigation?: boolean;
}

export default memo(RundownMenu);
function RundownMenu({ allowNavigation }: RundownMenuProps) {
  const [isOpen, handlers] = useDisclosure();
  const { getLocalizedString } = useTranslation();

  const clearSelectedEvents = useEventSelection((state) => state.clearSelectedEvents);
  const { deleteAllEntries } = useEntryActionsContext();
  const { setLocation } = useAppSettingsNavigation();

  const deleteAll = useCallback(() => {
    deleteAllEntries();
    clearSelectedEvents();
    handlers.close();
  }, [clearSelectedEvents, deleteAllEntries, handlers]);

  return (
    <>
      <div className={style.apart}>
        <DropdownMenu
          render={<Toolbar.Button render={<IconButton variant='subtle-white' aria-label='Rundown menu' />} />}
          items={[
            {
              type: 'item',
              label: getLocalizedString('rundown.header.manage_rundowns'),
              icon: IoList,
              onClick: () => setLocation('manage__rundowns'),
              disabled: !allowNavigation,
            },
            { type: 'divider' },
            {
              type: 'destructive',
              label: getLocalizedString('rundown.header.clear_all'),
              icon: IoTrash,
              onClick: handlers.open,
            },
          ]}
        >
          <IoEllipsisHorizontal />
        </DropdownMenu>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={handlers.close}
        title={getLocalizedString('rundown.header.clear_rundown_title')}
        showBackdrop
        showCloseButton
        bodyElements={
          <div dangerouslySetInnerHTML={{ __html: getLocalizedString('rundown.header.clear_rundown_message') }} />
        }
        footerElements={
          <>
            <Button variant='ghosted-white' size='large' onClick={handlers.close}>
              {getLocalizedString('common.cancel')}
            </Button>
            <Button variant='destructive' size='large' onClick={deleteAll}>
              {getLocalizedString('rundown.header.delete_all')}
            </Button>
          </>
        }
      />
    </>
  );
}
