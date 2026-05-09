import { useState } from 'react';
import {
  IoCopyOutline,
  IoDocumentOutline,
  IoDownloadOutline,
  IoEllipsisHorizontal,
  IoPencilOutline,
  IoTrash,
} from 'react-icons/io5';

import {
  deleteProject,
  downloadProject,
  duplicateProject,
  loadProject,
  renameProject,
} from '../../../../common/api/db';
import { invalidateAllCaches, maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Dialog from '../../../../common/components/dialog/Dialog';
import { DropdownMenu } from '../../../../common/components/dropdown-menu/DropdownMenu';
import { cx } from '../../../../common/utils/styleUtils';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import ProjectForm, { ProjectFormValues } from './ProjectForm';
import ProjectMergeForm from './ProjectMergeForm';

import style from './ProjectPanel.module.scss';

export type EditMode = 'rename' | 'duplicate' | 'merge' | null;

interface ProjectListItemProps {
  current?: boolean;
  filename: string;
  updatedAt: string;
  onToggleEditMode: (editMode: EditMode, filename: string | null) => void;
  onSubmit: () => void;
  onRefetch: () => Promise<void>;
  editingFilename: string | null;
  editingMode: EditMode | null;
}

export default function ProjectListItem({
  current,
  updatedAt,
  editingFilename,
  editingMode,
  filename,
  onRefetch,
  onSubmit,
  onToggleEditMode,
}: ProjectListItemProps) {
  const { getLocalizedString } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const handleSubmitAction = (actionType: 'rename' | 'duplicate') => {
    return async (values: ProjectFormValues) => {
      setLoading(true);
      setSubmitError(null);
      try {
        if (!values.filename) {
          setSubmitError(getLocalizedString('settings.project.list.filename_blank'));
          return;
        }
        const action = actionType === 'rename' ? renameProject : duplicateProject;
        await action(filename, values.filename);
        await onRefetch();
        onSubmit();
      } catch (error) {
        setSubmitError(maybeAxiosError(error));
      } finally {
        setLoading(false);
      }
    };
  };

  const handleLoad = async (filename: string) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await loadProject(filename);
      await onRefetch();
      await invalidateAllCaches();
    } catch (error) {
      setSubmitError(maybeAxiosError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await deleteProject(filename);
      await onRefetch();
    } catch (error) {
      setSubmitError(maybeAxiosError(error));
    } finally {
      setLoading(false);
    }
  };

  const submitDelete = async () => {
    await handleDelete(filename);
    setDeleteOpen(false);
  };

  const handleToggleEditMode = (editMode: EditMode, filename: string | null) => {
    setSubmitError(null);
    onToggleEditMode(editMode, filename);
  };

  const handleCancel = () => {
    handleToggleEditMode(null, null);
  };

  const isCurrentlyBeingEdited = filename === editingFilename;
  const showProjectForm = (editingMode === 'rename' || editingMode === 'duplicate') && filename === editingFilename;
  const showMergeForm = editingMode === 'merge' && isCurrentlyBeingEdited;
  const classes = cx([current && !isCurrentlyBeingEdited && style.current, isCurrentlyBeingEdited && style.isEditing]);

  return (
    <>
      {submitError && (
        <tr key='filename-error'>
          <td colSpan={99}>
            <Panel.Error>{submitError}</Panel.Error>
          </td>
        </tr>
      )}
      <tr key={filename} className={classes}>
        {showProjectForm ? (
          <td colSpan={99}>
            <ProjectForm
              action={editingMode}
              filename={filename}
              onSubmit={editingMode === 'duplicate' ? handleSubmitAction('duplicate') : handleSubmitAction('rename')}
              onCancel={handleCancel}
            />
          </td>
        ) : (
          <>
            <td className={style.containCell}>{filename}</td>
            <td>
              {current
                ? getLocalizedString('settings.project.list.currently_loaded')
                : new Date(updatedAt).toLocaleString()}
            </td>
            <td>
              <ActionMenu
                current={current}
                filename={filename}
                onChangeEditMode={handleToggleEditMode}
                onDelete={() => setDeleteOpen(true)}
                onLoad={handleLoad}
                isDisabled={loading || showMergeForm}
                onMerge={(filename) => handleToggleEditMode('merge', filename)}
              />
            </td>
          </>
        )}
      </tr>
      {showMergeForm && (
        <tr>
          <td colSpan={99}>
            <ProjectMergeForm onClose={handleCancel} fileName={filename} />
          </td>
        </tr>
      )}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={getLocalizedString('settings.project.list.delete_title')}
        showBackdrop
        showCloseButton
        bodyElements={getLocalizedString('settings.project.list.delete_body')}
        footerElements={
          <>
            <Button size='large' onClick={() => setDeleteOpen(false)}>
              {getLocalizedString('settings.project.list.cancel')}
            </Button>
            <Button variant='destructive' size='large' onClick={submitDelete} loading={loading}>
              {getLocalizedString('settings.project.list.delete_confirm')}
            </Button>
          </>
        }
      />
    </>
  );
}

interface ActionMenuProps {
  current?: boolean;
  filename: string;
  isDisabled: boolean;
  onChangeEditMode: (editMode: EditMode, filename: string) => void;
  onDelete: () => void;
  onLoad: (filename: string) => Promise<void>;
  onMerge: (filename: string) => void;
}
function ActionMenu(props: ActionMenuProps) {
  const { current, filename, isDisabled, onChangeEditMode, onDelete, onLoad, onMerge } = props;

  const { getLocalizedString } = useTranslation();

  const handleRename = () => {
    onChangeEditMode('rename', filename);
  };

  const handleDuplicate = () => {
    onChangeEditMode('duplicate', filename);
  };

  const handleDownload = async () => {
    await downloadProject(filename);
  };

  return (
    <DropdownMenu
      render={<IconButton variant='ghosted-white' />}
      disabled={isDisabled}
      items={[
        {
          type: 'item',
          icon: IoDownloadOutline,
          label: getLocalizedString('settings.project.list.menu_load'),
          onClick: () => onLoad(filename),
          disabled: current,
        },
        {
          type: 'item',
          icon: IoDownloadOutline,
          label: getLocalizedString('settings.project.list.menu_partial_load'),
          onClick: () => onMerge(filename),
          disabled: current,
        },
        {
          type: 'item',
          icon: IoPencilOutline,
          label: getLocalizedString('settings.project.list.menu_rename'),
          onClick: handleRename,
        },
        {
          type: 'item',
          icon: IoCopyOutline,
          label: getLocalizedString('settings.project.list.menu_duplicate'),
          onClick: handleDuplicate,
        },
        {
          type: 'item',
          icon: IoDocumentOutline,
          label: getLocalizedString('settings.project.list.menu_download'),
          onClick: handleDownload,
        },
        { type: 'divider' },
        {
          type: 'item',
          icon: IoTrash,
          label: getLocalizedString('settings.project.list.menu_delete'),
          onClick: onDelete,
          disabled: current,
        },
      ]}
    >
      <IoEllipsisHorizontal />
    </DropdownMenu>
  );
}
