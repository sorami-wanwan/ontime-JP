import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import {
  IoAdd,
  IoDocumentOutline,
  IoDownloadOutline,
  IoDuplicateOutline,
  IoEllipsisHorizontal,
  IoPencilOutline,
  IoTrash,
} from 'react-icons/io5';

import { downloadAsExcel } from '../../../../common/api/excel';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Dialog from '../../../../common/components/dialog/Dialog';
import { DropdownMenu } from '../../../../common/components/dropdown-menu/DropdownMenu';
import Tag from '../../../../common/components/tag/Tag';
import { useMutateProjectRundowns, useProjectRundowns } from '../../../../common/hooks-query/useProjectRundowns';
import { cx } from '../../../../common/utils/styleUtils';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import RundownRenameForm from './composite/RundownRenameForm';
import { ManageRundownForm } from './ManageRundownForm';

import style from './ManagePanel.module.scss';

export default function ManageRundowns() {
  const { data } = useProjectRundowns();
  const { duplicate, remove, load, rename } = useMutateProjectRundowns();
  const [isOpenDelete, deleteHandlers] = useDisclosure();
  const [isOpenLoad, loadHandlers] = useDisclosure();
  const [isNewLoad, newHandlers] = useDisclosure();
  const [targetRundown, setTargetRundown] = useState('');
  const [renamingRundown, setRenamingRundown] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { getLocalizedString } = useTranslation();

  const openLoad = (id: string) => {
    setActionError(null);
    setTargetRundown(id);
    loadHandlers.open();
  };

  const openDelete = (id: string) => {
    setActionError(null);
    setTargetRundown(id);
    deleteHandlers.open();
  };

  const openRename = (id: string) => {
    setActionError(null);
    setRenamingRundown(id);
  };

  const submitRundownLoad = async () => {
    try {
      await load(targetRundown);
    } catch (error) {
      setActionError(`${getLocalizedString('settings.manage.manage_rundowns.failed_load')}${maybeAxiosError(error)}`);
    } finally {
      loadHandlers.close();
    }
  };

  const submitRundownDuplicate = async (id: string) => {
    setActionError(null);
    setRenamingRundown(null);
    setTargetRundown('');

    try {
      await duplicate(id);
    } catch (error) {
      setActionError(
        `${getLocalizedString('settings.manage.manage_rundowns.failed_duplicate')}${maybeAxiosError(error)}`,
      );
    }
  };

  const submitRundownRename = async (id: string, newTitle: string) => {
    try {
      await rename([id, newTitle]);
      setRenamingRundown(null);
    } catch (error) {
      setActionError(`${getLocalizedString('settings.manage.manage_rundowns.failed_rename')}${maybeAxiosError(error)}`);
    }
  };

  const submitRundownDelete = async () => {
    try {
      await remove(targetRundown);
    } catch (error) {
      setActionError(`${getLocalizedString('settings.manage.manage_rundowns.failed_delete')}${maybeAxiosError(error)}`);
    } finally {
      deleteHandlers.close();
    }
  };

  const handleDownloadXlsx = async (rundownId: string, title: string) => {
    await downloadAsExcel(rundownId, title);
  };

  return (
    <>
      <Panel.Section>
        <Panel.Card>
          <Panel.SubHeader>
            {getLocalizedString('settings.manage.manage_rundowns.title')}
            <Panel.InlineElements>
              <Button
                onClick={() => {
                  setActionError(null);
                  newHandlers.open();
                }}
              >
                {getLocalizedString('settings.manage.custom_fields.new')} <IoAdd />
              </Button>
            </Panel.InlineElements>
          </Panel.SubHeader>
          <Panel.Divider />
          <Panel.Section>
            {isNewLoad && <ManageRundownForm onClose={newHandlers.close} />}
            {actionError && <Panel.Error>{actionError}</Panel.Error>}
            <Panel.Table>
              <thead>
                <tr>
                  <th>{getLocalizedString('settings.manage.manage_rundowns.table_entries')}</th>
                  <th style={{ width: '100%' }}>{getLocalizedString('settings.manage.manage_rundowns.table_title')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.rundowns?.map(({ id, numEntries, title }) => {
                  const isLoaded = data.loaded === id;
                  const isRenaming = renamingRundown === id;

                  if (isRenaming) {
                    return (
                      <tr key={id}>
                        <td colSpan={3}>
                          <RundownRenameForm
                            onCancel={() => setRenamingRundown(null)}
                            onSubmit={(newTitle: string) => submitRundownRename(id, newTitle)}
                            initialTitle={title}
                          />
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={id} className={cx([isLoaded && style.current])}>
                      <td>{numEntries}</td>
                      <td>
                        {title} {isLoaded && <Tag>{getLocalizedString('settings.manage.manage_rundowns.loaded')}</Tag>}
                      </td>
                      <td>
                        <DropdownMenu
                          render={<IconButton variant='ghosted-white' />}
                          items={[
                            {
                              type: 'item',
                              icon: IoPencilOutline,
                              label: getLocalizedString('settings.manage.manage_rundowns.rename'),
                              onClick: () => openRename(id),
                            },
                            {
                              type: 'item',
                              icon: IoDownloadOutline,
                              label: getLocalizedString('settings.manage.manage_rundowns.load'),
                              onClick: () => openLoad(id),
                              disabled: isLoaded,
                            },
                            {
                              type: 'item',
                              icon: IoDocumentOutline,
                              label: getLocalizedString('settings.manage.manage_rundowns.download_xlsx'),
                              onClick: () => handleDownloadXlsx(id, title),
                            },
                            {
                              type: 'item',
                              icon: IoDuplicateOutline,
                              label: getLocalizedString('settings.manage.manage_rundowns.duplicate'),
                              onClick: () => submitRundownDuplicate(id),
                            },
                            { type: 'divider' },
                            {
                              type: 'destructive',
                              icon: IoTrash,
                              label: getLocalizedString('settings.manage.custom_fields.delete_title').replace(
                                'の削除',
                                '',
                              ), // or create a specific key if needed, or use 'settings.automations.trigger_form.delete_entry'
                              onClick: () => openDelete(id),
                              disabled: isLoaded,
                            },
                          ]}
                        >
                          <IoEllipsisHorizontal />
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Panel.Table>
          </Panel.Section>
        </Panel.Card>
      </Panel.Section>
      <Dialog
        isOpen={isOpenDelete}
        onClose={deleteHandlers.close}
        title={getLocalizedString('settings.manage.manage_rundowns.delete_title')}
        showBackdrop
        showCloseButton
        bodyElements={
          <span
            dangerouslySetInnerHTML={{ __html: getLocalizedString('settings.manage.manage_rundowns.delete_confirm') }}
          />
        }
        footerElements={
          <>
            <Button size='large' onClick={deleteHandlers.close}>
              {getLocalizedString('settings.manage.custom_views.cancel')}
            </Button>
            <Button variant='destructive' size='large' onClick={submitRundownDelete}>
              {getLocalizedString('settings.manage.manage_rundowns.delete_button')}
            </Button>
          </>
        }
      />
      <Dialog
        isOpen={isOpenLoad}
        onClose={loadHandlers.close}
        title={getLocalizedString('settings.manage.manage_rundowns.load_title')}
        showBackdrop
        showCloseButton
        bodyElements={
          <span
            dangerouslySetInnerHTML={{ __html: getLocalizedString('settings.manage.manage_rundowns.load_confirm') }}
          />
        }
        footerElements={
          <>
            <Button size='large' onClick={loadHandlers.close}>
              {getLocalizedString('settings.manage.custom_views.cancel')}
            </Button>
            <Button variant='primary' size='large' onClick={submitRundownLoad}>
              {getLocalizedString('settings.manage.manage_rundowns.load_button')}
            </Button>
          </>
        }
      />
    </>
  );
}
