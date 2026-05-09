import { NormalisedAutomation, TimerLifeCycle, TriggerDTO } from 'ontime-types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { addTrigger, editTrigger } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Input from '../../../../common/components/input/input/Input';
import Select from '../../../../common/components/select/Select';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import { cycles } from './automationUtils';

interface TriggerFormProps {
  automations: NormalisedAutomation;
  initialId?: string;
  initialTitle?: string;
  initialAutomationId?: string;
  initialTrigger?: TimerLifeCycle;
  onCancel: () => void;
  postSubmit: () => void;
}

export default function TriggerForm({
  automations,
  initialId,
  initialTitle,
  initialAutomationId,
  initialTrigger,
  onCancel,
  postSubmit,
}: TriggerFormProps) {
  const { getLocalizedString } = useTranslation();
  const {
    handleSubmit,
    register,
    setFocus,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<TriggerDTO>({
    defaultValues: {
      title: initialTitle,
      trigger: initialTrigger ?? (cycles[0].value as TimerLifeCycle | undefined),
      automationId: initialAutomationId ?? automations?.[Object.keys(automations)[0]]?.id,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  // give initial focus to the title field
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  const onSubmit = async (values: TriggerDTO) => {
    // if we were passed an ID we are editing a Trigger
    if (initialId) {
      try {
        await editTrigger(initialId, { id: initialId, ...values });
        postSubmit();
      } catch (error) {
        setError('root', {
          message: getLocalizedString('settings.automations.trigger_form.failed_edit_trigger').replace(
            '{{error}}',
            maybeAxiosError(error),
          ),
        });
      }
      return;
    }

    // otherwise we are creating a new automation
    try {
      await addTrigger(values);
      postSubmit();
    } catch (error) {
      setError('root', {
        message: getLocalizedString('settings.automations.trigger_form.failed_add_trigger').replace(
          '{{error}}',
          maybeAxiosError(error),
        ),
      });
    }
  };

  const automationSelect = Object.keys(automations).map((automation) => {
    return {
      value: automation,
      label: automations[automation].title,
    };
  });

  const canSubmit = isDirty && isValid;

  return (
    <Panel.Indent
      as='form'
      name='trigger-form'
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => preventEscape(event, onCancel)}
    >
      <Panel.SubHeader>
        {initialId
          ? getLocalizedString('settings.automations.trigger_form.edit_trigger')
          : getLocalizedString('settings.automations.trigger_form.create_trigger')}
      </Panel.SubHeader>
      <label>
        {getLocalizedString('settings.automations.trigger_form.title')}
        <Input
          {...register('title', {
            required: { value: true, message: getLocalizedString('settings.automations.trigger_form.required_field') },
          })}
          fluid
          defaultValue={initialTitle}
        />
        <Panel.Error>{errors.title?.message}</Panel.Error>
      </label>
      <label>
        {getLocalizedString('settings.automations.trigger_form.lifecycle_trigger')}
        <Select
          value={watch('trigger')}
          onValueChange={(value) => {
            if (value === null) return;
            setValue('trigger', value as TimerLifeCycle, { shouldDirty: true });
          }}
          options={cycles.map((cycle) => ({ value: cycle.value, label: cycle.label }))}
          aria-label={getLocalizedString('settings.automations.trigger_form.lifecycle_trigger')}
        />
        <Panel.Error>{errors.trigger?.message}</Panel.Error>
      </label>
      <label>
        {getLocalizedString('settings.automations.trigger_form.automation_title')}
        <Select
          value={watch('automationId')}
          onValueChange={(value: string | null) => {
            if (value === null) return;
            setValue('automationId', value, { shouldDirty: true });
          }}
          options={automationSelect}
          aria-label={getLocalizedString('settings.automations.trigger_form.automation_title')}
        />
        <Panel.Error>{errors.automationId?.message}</Panel.Error>
      </label>
      <Panel.InlineElements align='end'>
        <Button disabled={isSubmitting} onClick={onCancel}>
          {getLocalizedString('settings.automations.trigger_form.cancel')}
        </Button>
        <Button type='submit' variant='primary' disabled={!canSubmit} loading={isSubmitting}>
          {getLocalizedString('settings.save')}
        </Button>
      </Panel.InlineElements>
    </Panel.Indent>
  );
}
