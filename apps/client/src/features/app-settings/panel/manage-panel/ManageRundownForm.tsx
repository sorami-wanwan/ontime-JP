import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Button from '../../../../common/components/buttons/Button';
import Input from '../../../../common/components/input/input/Input';
import { useMutateProjectRundowns } from '../../../../common/hooks-query/useProjectRundowns';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';

type NewRundownFormState = {
  title: string;
};

interface ManageRundownForm {
  onClose: () => void;
}

export function ManageRundownForm({ onClose }: ManageRundownForm) {
  const { create } = useMutateProjectRundowns();
  const { getLocalizedString } = useTranslation();

  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewRundownFormState>({
    defaultValues: { title: '' },
  });

  const createRundown = async (values: NewRundownFormState) => {
    try {
      await create(values.title || 'untitled');
      onClose();
    } catch (error) {
      setError('root', { message: `${getLocalizedString('settings.manage.manage_rundowns.failed_create')} ${error}` });
    }
  };

  // give initial focus to the title field
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  return (
    <Panel.Indent as='form' onSubmit={handleSubmit(createRundown)}>
      <Panel.Section>
        <label>
          <Panel.Description>{getLocalizedString('settings.manage.manage_rundowns.rundown_title')}</Panel.Description>
          <Input
            {...register('title')}
            fluid
            placeholder={getLocalizedString('settings.manage.manage_rundowns.rundown_name_placeholder')}
          />
        </label>
      </Panel.Section>
      <Panel.InlineElements relation='inner' align='end'>
        <Button variant='ghosted' disabled={isSubmitting} onClick={onClose}>
          {getLocalizedString('common.cancel')}
        </Button>
        <Button type='submit' variant='primary' disabled={isSubmitting}>
          {getLocalizedString('settings.manage.manage_rundowns.create_button')}
        </Button>
      </Panel.InlineElements>
      {errors.root && <Panel.Error>{errors.root.message}</Panel.Error>}
    </Panel.Indent>
  );
}
