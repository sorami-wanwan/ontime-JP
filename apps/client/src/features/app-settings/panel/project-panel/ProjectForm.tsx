import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '../../../../common/components/buttons/Button';
import Input from '../../../../common/components/input/input/Input';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';

import style from './ProjectPanel.module.scss';

export type ProjectFormValues = {
  filename: string;
};

interface ProjectFormProps {
  action: 'duplicate' | 'rename' | 'merge';
  filename: string;
  onCancel: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
}

export default function ProjectForm({ action, filename, onSubmit, onCancel }: ProjectFormProps) {
  const { getLocalizedString } = useTranslation();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, isDirty, isValid },
    setFocus,
  } = useForm<ProjectFormValues>({
    defaultValues: { filename },
    values: { filename },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    setFocus('filename');
  }, [setFocus]);

  const actionTranslationKey =
    action === 'duplicate'
      ? 'settings.project.list.menu_duplicate'
      : action === 'rename'
        ? 'settings.project.list.menu_rename'
        : 'settings.project.merge.submit';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => preventEscape(event, onCancel)}
      className={style.form}
    >
      <Input
        className={style.formInput}
        id='filename'
        placeholder={getLocalizedString('settings.project.form.enter_new_name')}
        {...register('filename', { required: true })}
      />
      <Panel.InlineElements relation='inner'>
        <Button onClick={onCancel} variant='ghosted' disabled={isSubmitting}>
          {getLocalizedString('settings.project.form.cancel')}
        </Button>
        <Button
          variant='primary'
          disabled={!isDirty || !isValid || isSubmitting}
          type='submit'
          className={style.saveButton}
        >
          {getLocalizedString(actionTranslationKey)}
        </Button>
      </Panel.InlineElements>
    </form>
  );
}
