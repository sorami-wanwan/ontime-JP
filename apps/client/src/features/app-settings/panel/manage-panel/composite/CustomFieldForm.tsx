import { CustomField } from 'ontime-types';
import { checkRegex, customFieldLabelToKey } from 'ontime-utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { maybeAxiosError } from '../../../../../common/api/utils';
import Button from '../../../../../common/components/buttons/Button';
import Info from '../../../../../common/components/info/Info';
import SwatchSelect from '../../../../../common/components/input/colour-input/SwatchSelect';
import Input from '../../../../../common/components/input/input/Input';
import RadioGroup from '../../../../../common/components/radio-group/RadioGroup';
import useCustomFields from '../../../../../common/hooks-query/useCustomFields';
import { preventEscape } from '../../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../../translation/useTranslation';
import * as Panel from '../../../panel-utils/PanelUtils';

import style from '../ManagePanel.module.scss';

interface CustomFieldsFormProps {
  onSubmit: (field: CustomField) => Promise<void>;
  onCancel: () => void;
  initialColour?: string;
  initialLabel?: string;
  initialKey?: string;
  initialType?: CustomField['type'];
}

type CustomFieldFormData = CustomField & { key: string };

export default function CustomFieldForm({
  onSubmit,
  onCancel,
  initialColour,
  initialLabel,
  initialKey,
  initialType,
}: CustomFieldsFormProps) {
  const { data } = useCustomFields();
  const { getLocalizedString } = useTranslation();

  // we use this to force an update
  const [_, setColour] = useState(initialColour || '');

  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<CustomFieldFormData>({
    defaultValues: { type: initialType ?? 'text', label: initialLabel || '', colour: initialColour || '' },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const setupSubmit = async (values: CustomFieldFormData) => {
    const { type, label, colour } = values;
    const newField: CustomField = {
      type,
      colour,
      label,
    };
    try {
      await onSubmit(newField);
    } catch (error) {
      setError('root', { type: 'custom', message: maybeAxiosError(error) });
    }
  };

  // give initial focus to the label
  useEffect(() => {
    setFocus('label');
  }, [setFocus]);

  const handleSelectColour = (colour: string) => {
    setColour(colour);
    setValue('colour', colour, { shouldDirty: true });
  };

  const colour = getValues('colour');
  const canSubmit = isDirty && isValid;
  // if initial values are given, we can assume we are in edit mode
  const isEditMode = initialKey !== undefined;

  return (
    <Panel.Indent as='form' onSubmit={handleSubmit(setupSubmit)} onKeyDown={(event) => preventEscape(event, onCancel)}>
      <Info>
        {getLocalizedString('settings.manage.custom_fields.performance_warning_1')}
        <br />
        {getLocalizedString('settings.manage.custom_fields.performance_warning_2')}
      </Info>
      <div>
        <Panel.Description>{getLocalizedString('settings.manage.custom_fields.type')}</Panel.Description>
        <RadioGroup
          orientation='horizontal'
          disabled={isEditMode}
          onValueChange={(value) => setValue('type', value, { shouldDirty: true })}
          value={watch('type')}
          items={[
            { value: 'text', label: getLocalizedString('settings.manage.custom_fields.type_text') },
            { value: 'image', label: getLocalizedString('settings.manage.custom_fields.type_image') },
          ]}
        />
      </div>
      <div className={style.twoCols}>
        <label>
          <Panel.Description>{getLocalizedString('settings.manage.custom_fields.label')}</Panel.Description>
          {errors.label && <Panel.Error>{errors.label.message}</Panel.Error>}
          <Input
            {...register('label', {
              required: {
                value: true,
                message: getLocalizedString('settings.automations.trigger_form.required_field'),
              },
              onChange: () => setValue('key', customFieldLabelToKey(getValues('label')) ?? 'N/A'),
              validate: (value) => {
                if (value.trim().length === 0)
                  return getLocalizedString('settings.automations.trigger_form.required_field');
                if (!checkRegex.isAlphanumericWithSpace(value))
                  return getLocalizedString('settings.manage.custom_fields.error_alphanumeric');
                if (!isEditMode) {
                  if (isEditMode && Object.keys(data).includes(value))
                    return getLocalizedString('settings.manage.custom_fields.error_unique');
                }
                return true;
              },
            })}
            fluid
          />
        </label>

        <label>
          <Panel.Description>{getLocalizedString('settings.manage.custom_fields.key_description')}</Panel.Description>
          <Input {...register('key')} variant='ghosted' readOnly fluid />
        </label>
      </div>
      <label>
        <Panel.Description>{getLocalizedString('settings.manage.custom_fields.colour')}</Panel.Description>
        <SwatchSelect name='colour' value={colour} handleChange={(_field, value) => handleSelectColour(value)} />
      </label>
      {errors.root && <Panel.Error>{errors.root.message}</Panel.Error>}
      <Panel.InlineElements relation='inner' align='end'>
        <Button variant='ghosted' onClick={onCancel}>
          {getLocalizedString('common.cancel')}
        </Button>
        <Button type='submit' variant='primary' disabled={!canSubmit} loading={isSubmitting}>
          {getLocalizedString('settings.manage.custom_fields.save')}
        </Button>
      </Panel.InlineElements>
    </Panel.Indent>
  );
}
