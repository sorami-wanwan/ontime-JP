import { useForm } from 'react-hook-form';

import { editAutomationSettings } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Input from '../../../../common/components/input/input/Input';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import Switch from '../../../../common/components/switch/Switch';
import Tag from '../../../../common/components/tag/Tag';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { isOnlyNumbers } from '../../../../common/utils/regex';
import { isOntimeCloud } from '../../../../externals';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';

const oscApiDocsUrl = 'https://docs.getontime.no/api/protocols/osc/';

interface AutomationSettingsProps {
  enabledAutomations: boolean;
  enabledOscIn: boolean;
  oscPortIn: number;
  automationState?: boolean;
  oscInputState?: boolean;
}

export default function AutomationSettingsForm({
  enabledAutomations,
  enabledOscIn,
  oscPortIn,
  automationState,
  oscInputState,
}: AutomationSettingsProps) {
  const { getLocalizedString } = useTranslation();
  const {
    handleSubmit,
    reset,
    register,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<AutomationSettingsProps>({
    mode: 'onChange',
    defaultValues: { enabledAutomations, enabledOscIn, oscPortIn },
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  const onSubmit = async (formData: AutomationSettingsProps) => {
    try {
      await editAutomationSettings(formData);
      reset(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    }
  };

  const onReset = () => {
    reset({ enabledAutomations, enabledOscIn, oscPortIn });
  };

  const canSubmit = !isSubmitting && isDirty && isValid;
  const automationsEnabled = watch('enabledAutomations');
  const oscInputEnabled = watch('enabledOscIn');

  return (
    <Panel.Card>
      <Panel.SubHeader>
        {getLocalizedString('settings.automations.automation_settings.title')}
        <Panel.InlineElements>
          <Button variant='ghosted' onClick={onReset} disabled={!canSubmit}>
            {getLocalizedString('settings.automations.automation_settings.revert')}
          </Button>
          <Button
            variant='primary'
            type='submit'
            form='automation-settings-form'
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            {getLocalizedString('settings.save')}
          </Button>
        </Panel.InlineElements>
      </Panel.SubHeader>
      {errors?.root && <Panel.Error>{errors.root.message}</Panel.Error>}

      <Panel.Divider />

      <Panel.Section>
        <Info>
          <p>{getLocalizedString('settings.automations.automation_settings.info_1')}</p>
          <p>- {getLocalizedString('settings.automations.automation_settings.info_2')}</p>
          <p>- {getLocalizedString('settings.automations.automation_settings.info_3')}</p>
          <br />
          <ExternalLink href={oscApiDocsUrl}>
            {getLocalizedString('settings.features.url_presets.see_docs')}
          </ExternalLink>
        </Info>
      </Panel.Section>

      <Panel.Section
        as='form'
        id='automation-settings-form'
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => preventEscape(event, onReset)}
      >
        <Panel.Loader isLoading={false} />

        <Panel.Title>{getLocalizedString('settings.automations.automation_settings.automation')}</Panel.Title>
        <Panel.ListGroup>
          <Panel.ListItem>
            <Panel.Field
              title={
                <>
                  <span>{getLocalizedString('settings.automations.automation_settings.enable_automations')}</span>
                  {automationState === false && (
                    <Tag variant='warning'>{getLocalizedString('settings.automations.automation_settings.off')}</Tag>
                  )}
                </>
              }
              description={
                automationState === false
                  ? getLocalizedString('settings.automations.automation_settings.automations_off')
                  : getLocalizedString('settings.automations.automation_settings.allow_ontime')
              }
              descriptionTone={automationState === false ? 'warning' : 'default'}
              error={errors.enabledAutomations?.message}
            />
            <Switch
              size='large'
              checked={automationsEnabled}
              onCheckedChange={(value: boolean) =>
                setValue('enabledAutomations', value, { shouldDirty: true, shouldValidate: true })
              }
            />
          </Panel.ListItem>
        </Panel.ListGroup>
        <Panel.Title>{getLocalizedString('settings.automations.automation_settings.osc_input')}</Panel.Title>

        <Panel.ListGroup>
          {isOntimeCloud && (
            <Info>{getLocalizedString('settings.automations.automation_settings.osc_cloud_warning')}</Info>
          )}
          <Panel.ListItem>
            <Panel.Field
              title={
                <>
                  <span>{getLocalizedString('settings.automations.automation_settings.osc_input_label')}</span>
                  {oscInputState === false && (
                    <Tag variant='warning'>{getLocalizedString('settings.automations.automation_settings.off')}</Tag>
                  )}
                </>
              }
              description={
                oscInputState === false
                  ? getLocalizedString('settings.automations.automation_settings.osc_off')
                  : getLocalizedString('settings.automations.automation_settings.allow_control')
              }
              descriptionTone={oscInputState === false ? 'warning' : 'default'}
              error={errors.enabledOscIn?.message}
            />
            <Switch
              size='large'
              checked={oscInputEnabled}
              onCheckedChange={(value: boolean) =>
                setValue('enabledOscIn', value, { shouldDirty: true, shouldValidate: true })
              }
            />
          </Panel.ListItem>
          <Panel.ListItem>
            <Panel.Field
              title={getLocalizedString('settings.automations.automation_settings.listen_port')}
              description={getLocalizedString('settings.automations.automation_settings.port_default')}
              error={errors.oscPortIn?.message}
            />
            <Input
              id='oscPortIn'
              placeholder='8888'
              maxLength={5}
              style={{ textAlign: 'right', width: '5rem' }}
              type='number'
              fluid
              {...register('oscPortIn', {
                required: {
                  value: true,
                  message: getLocalizedString('settings.automations.trigger_form.required_field'),
                },
                max: {
                  value: 65535,
                  message: getLocalizedString('settings.automations.automation_settings.port_range'),
                },
                min: {
                  value: 1024,
                  message: getLocalizedString('settings.automations.automation_settings.port_range'),
                },
                pattern: {
                  value: isOnlyNumbers,
                  message: getLocalizedString('settings.automations.automation_settings.value_numeric'),
                },
              })}
            />
          </Panel.ListItem>
        </Panel.ListGroup>
      </Panel.Section>
    </Panel.Card>
  );
}
