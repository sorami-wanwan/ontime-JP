import { checkRegex } from 'ontime-utils';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { maybeAxiosError } from '../../../../../common/api/utils';
import Button from '../../../../../common/components/buttons/Button';
import Input from '../../../../../common/components/input/input/Input';
import { preventEscape } from '../../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../../translation/useTranslation';
import * as Panel from '../../../panel-utils/PanelUtils';

interface RundownRenameFormProps {
  onSubmit: (newTitle: string) => Promise<void>;
  onCancel: () => void;
  initialTitle: string;
}

interface FormData {
  title: string;
}

export default function RundownRenameForm({ onSubmit, onCancel, initialTitle }: RundownRenameFormProps) {
  const { getLocalizedString } = useTranslation();
  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<FormData>({
    defaultValues: { title: initialTitle },
    mode: 'onChange',
  });

  const setupSubmit = async (values: FormData) => {
    try {
      await onSubmit(values.title);
    } catch (error) {
      setError('root', { type: 'custom', message: maybeAxiosError(error) });
    }
  };

  // Give initial focus to the title input
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  const canSubmit = isDirty && isValid;

  return (
    <Panel.Indent as='form' onSubmit={handleSubmit(setupSubmit)} onKeyDown={(event) => preventEscape(event, onCancel)}>
      <label>
        <Panel.Description>{getLocalizedString('settings.manage.manage_rundowns.rundown_title')}</Panel.Description>
        <Input
          {...register('title', {
            required: {
              value: true,
              message: getLocalizedString('settings.manage.manage_rundowns.error_title_required'),
            },
            validate: (value) => {
              if (value.trim().length === 0)
                return getLocalizedString('settings.manage.manage_rundowns.error_title_empty');
              if (checkRegex.isAlphanumericWithSpace(value) === false)
                return getLocalizedString('settings.manage.manage_rundowns.error_title_alphanumeric');
              return true;
            },
          })}
          fluid
        />
        {errors.title && <Panel.Error>{errors.title.message}</Panel.Error>}
      </label>
      {errors.root && <Panel.Error>{errors.root.message}</Panel.Error>}
      <Panel.InlineElements relation='inner' align='end'>
        <Button variant='ghosted' onClick={onCancel}>
          {getLocalizedString('settings.manage.custom_views.cancel')}
        </Button>
        <Button type='submit' variant='primary' disabled={!canSubmit} loading={isSubmitting}>
          {getLocalizedString('settings.manage.custom_fields.save')}
        </Button>
      </Panel.InlineElements>
    </Panel.Indent>
  );
}
