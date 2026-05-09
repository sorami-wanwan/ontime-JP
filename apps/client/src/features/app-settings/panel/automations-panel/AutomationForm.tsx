import {
  Automation,
  AutomationDTO,
  HTTPOutput,
  OSCOutput,
  OntimeAction,
  isHTTPOutput,
  isOSCOutput,
  isOntimeAction,
} from 'ontime-types';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { IoAdd, IoTrash } from 'react-icons/io5';

import { addAutomation, editAutomation, testOutput } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Info from '../../../../common/components/info/Info';
import Input from '../../../../common/components/input/input/Input';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import RadioGroup from '../../../../common/components/radio-group/RadioGroup';
import Select from '../../../../common/components/select/Select';
import Tag from '../../../../common/components/tag/Tag';
import useAutomationSettings from '../../../../common/hooks-query/useAutomationSettings';
import useCustomFields from '../../../../common/hooks-query/useCustomFields';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { startsWithHttp } from '../../../../common/utils/regex';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import { isAutomation, makeFieldList } from './automationUtils';
import OntimeActionForm from './OntimeActionForm';
import TemplateInput from './template-input/TemplateInput';

import style from './AutomationForm.module.scss';

const integrationsDocsUrl = 'https://docs.getontime.no/api/automation/#using-variables-in-automation';

interface AutomationFormProps {
  automation: Automation | AutomationDTO;
  onClose: () => void;
}

export default function AutomationForm({ automation, onClose }: AutomationFormProps) {
  const { getLocalizedString } = useTranslation();
  const isEdit = isAutomation(automation);
  const { data } = useCustomFields();
  const { refetch } = useAutomationSettings();
  const fieldList = useMemo(() => makeFieldList(data), [data]);

  const {
    control,
    handleSubmit,
    getValues,
    register,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<AutomationDTO>({
    mode: 'onChange',
    defaultValues: {
      title: automation?.title ?? '',
      filterRule: automation?.filterRule ?? 'all',
      filters: automation?.filters ?? [],
      outputs: automation?.outputs ?? [],
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const {
    fields: fieldFilters,
    append: appendFilter,
    remove: removeFilter,
  } = useFieldArray({
    name: 'filters',
    control,
  });

  const {
    fields: fieldOutputs,
    append: appendOutput,
    remove: removeOutput,
  } = useFieldArray({
    name: 'outputs',
    control,
  });

  // give initial focus to the title field
  useEffect(() => {
    setFocus('title');
  }, [setFocus]);

  const handleAddNewFilter = () => {
    appendFilter({ field: '', operator: 'equals', value: '' });
  };

  const handleAddNewOSCOutput = () => {
    // @ts-expect-error -- we dont want to pass a port to the new object
    appendOutput({ type: 'osc', targetIP: '', targetPort: undefined, address: '', args: '' });
  };

  const handleAddNewHTTPOutput = () => {
    appendOutput({ type: 'http', url: '' });
  };

  const handleAddnewOntimeAction = () => {
    appendOutput({ type: 'ontime', action: 'aux1-start' });
  };

  const handleTestOSCOutput = async (index: number) => {
    try {
      const values = getValues(`outputs.${index}`) as OSCOutput;
      if (!values.targetIP || !values.targetPort || !values.address) {
        return;
      }
      await testOutput({
        type: 'osc',
        targetIP: values.targetIP,
        targetPort: values.targetPort,
        address: values.address,
        args: values.args,
      });
    } catch (_error) {
      /** we dont handle errors here, users should use the network tab */
    }
  };

  const handleTestHTTPOutput = async (index: number) => {
    try {
      const values = getValues(`outputs.${index}`) as HTTPOutput;
      if (!values.url) {
        return;
      }
      await testOutput({
        type: 'http',
        url: values.url,
      });
    } catch (_error) {
      /** we dont handle errors here, users should use the network tab */
    }
  };

  const handleTestOntimeAction = async (index: number) => {
    try {
      const values = getValues(`outputs.${index}`) as OntimeAction;
      // NOTE: there is no meaningful validation to do here, we let the server deal with the data
      await testOutput({
        ...values,
        type: 'ontime',
      });
    } catch (_error) {
      /** we dont handle errors here */
    }
  };

  const onSubmit = async (values: AutomationDTO) => {
    if (isAutomation(automation)) {
      await handleEdit(automation.id, { id: automation.id, ...values });
    } else {
      await handleCreate(values);
    }
    refetch();

    async function handleEdit(id: string, values: Automation) {
      try {
        await editAutomation(id, values);
        onClose();
      } catch (error) {
        setError('root', { message: maybeAxiosError(error) });
      }
    }

    async function handleCreate(values: AutomationDTO) {
      try {
        await addAutomation(values);
        onClose();
      } catch (error) {
        setError('root', { message: maybeAxiosError(error) });
      }
    }
  };

  const canSubmit = !isSubmitting && isDirty && isValid;

  return (
    <Panel.Indent
      as='form'
      name='automation-form'
      onSubmit={handleSubmit(onSubmit)}
      className={style.outerColumn}
      onKeyDown={(event) => preventEscape(event, onClose)}
    >
      <Panel.SubHeader>
        {isEdit
          ? getLocalizedString('settings.automations.automation_form.edit_automation')
          : getLocalizedString('settings.automations.automation_form.create_automation')}
      </Panel.SubHeader>
      <div className={style.innerSection}>
        <h3>{getLocalizedString('settings.automations.automation_form.automation_options')}</h3>
        <div className={style.titleSection}>
          <label>
            {getLocalizedString('settings.automations.automation_form.title')}
            <Input
              {...register('title', {
                required: {
                  value: true,
                  message: getLocalizedString('settings.automations.trigger_form.required_field'),
                },
              })}
              fluid
              placeholder={getLocalizedString('settings.automations.automation_form.load_preset')}
            />
          </label>
          <Panel.Error>{errors.title?.message}</Panel.Error>
        </div>
      </div>

      <div className={style.innerSection}>
        <h3>{getLocalizedString('settings.automations.automation_form.filters_optional')}</h3>
        <div className={style.ruleSection}>
          <label>
            {getLocalizedString('settings.automations.automation_form.trigger_outputs_if')}
            <RadioGroup
              orientation='horizontal'
              value={watch('filterRule')}
              onValueChange={(value) => setValue('filterRule', value, { shouldDirty: true })}
              items={[
                { value: 'all', label: getLocalizedString('settings.automations.automation_form.all_filters_pass') },
                { value: 'any', label: getLocalizedString('settings.automations.automation_form.any_filter_passes') },
              ]}
            />
          </label>
          {fieldFilters.map((field, index) => {
            const key = `filters.${index}.field.${field.id}`;
            return (
              <div key={key} className={style.filterSection}>
                <label>
                  {getLocalizedString('settings.automations.automation_form.runtime_data_source')}
                  <Select<string | null>
                    // need to normalize '' to null for the Select to show the placeholder
                    value={watch(`filters.${index}.field`) || null}
                    onValueChange={(value) => {
                      if (value === null) return;
                      setValue(`filters.${index}.field`, value, { shouldDirty: true });
                    }}
                    options={fieldList.map(({ value, label }) => ({
                      value,
                      label,
                      disabled: value === null,
                    }))}
                    aria-label={getLocalizedString('settings.automations.automation_form.event_field')}
                  />
                  <Panel.Error>{errors.filters?.[index]?.field?.message}</Panel.Error>
                </label>
                <label>
                  {getLocalizedString('settings.automations.automation_form.matching_condition')}
                  <Select
                    value={watch(`filters.${index}.operator`)}
                    onValueChange={(value: string | null) => {
                      if (value === null) return;
                      setValue(
                        `filters.${index}.operator`,
                        value as 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains',
                        { shouldDirty: true },
                      );
                    }}
                    options={[
                      {
                        value: 'equals',
                        label: getLocalizedString('settings.automations.automation_form.operator_equals'),
                      },
                      {
                        value: 'not_equals',
                        label: getLocalizedString('settings.automations.automation_form.operator_not_equals'),
                      },
                      {
                        value: 'contains',
                        label: getLocalizedString('settings.automations.automation_form.operator_contains'),
                      },
                    ]}
                    aria-label={getLocalizedString('settings.automations.automation_form.operator')}
                  />
                  <Panel.Error>{errors.filters?.[index]?.operator?.message}</Panel.Error>
                </label>
                <label>
                  {getLocalizedString('settings.automations.automation_form.value_to_match')}
                  <Input
                    {...register(`filters.${index}.value`)}
                    fluid
                    placeholder={getLocalizedString('settings.automations.automation_form.value_placeholder')}
                  />
                </label>
                <div>
                  <span>&nbsp;</span>
                  <div>
                    <IconButton
                      aria-label={getLocalizedString('settings.automations.automation_form.delete')}
                      variant='ghosted-destructive'
                      onClick={() => removeFilter(index)}
                    >
                      <IoTrash />
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })}
          <div>
            <Button onClick={handleAddNewFilter}>
              {getLocalizedString('settings.automations.automation_form.add_filter')} <IoAdd />
            </Button>
          </div>
        </div>
      </div>

      <div className={style.innerColumn}>
        <h3>{getLocalizedString('settings.automations.automation_form.outputs')}</h3>
        <Info>
          <span
            dangerouslySetInnerHTML={{
              __html: getLocalizedString('settings.automations.automation_form.outputs_info'),
            }}
          />
          <ExternalLink href={integrationsDocsUrl}>
            {getLocalizedString('settings.automations.automation_form.see_docs_templates')}
          </ExternalLink>
        </Info>

        {fieldOutputs.map((output, index) => {
          if (isOSCOutput(output)) {
            const rowErrors = errors.outputs?.[index] as
              | {
                  targetIP?: { message?: string };
                  targetPort?: { message?: string };
                  address?: { message?: string };
                  args?: { message?: string };
                }
              | undefined;

            return (
              <div key={output.id} className={style.outputCard}>
                <Tag>OSC</Tag>
                <div className={style.oscSection}>
                  <label>
                    {getLocalizedString('settings.automations.automation_form.target_ip')}
                    <Input
                      {...register(`outputs.${index}.targetIP`, {
                        required: {
                          value: true,
                          message: getLocalizedString('settings.automations.trigger_form.required_field'),
                        },
                      })}
                      fluid
                      placeholder='127.0.0.1'
                    />
                    <Panel.Error>{rowErrors?.targetIP?.message}</Panel.Error>
                  </label>
                  <label>
                    {getLocalizedString('settings.automations.automation_form.target_port')}
                    <Input
                      {...register(`outputs.${index}.targetPort`, {
                        required: {
                          value: true,
                          message: getLocalizedString('settings.automations.trigger_form.required_field'),
                        },
                        setValueAs: (value) => (value === '' ? 0 : Number(value)),
                        max: {
                          value: 65535,
                          message: getLocalizedString('settings.automations.automation_settings.port_range'),
                        },
                        min: {
                          value: 1024,
                          message: getLocalizedString('settings.automations.automation_settings.port_range'),
                        },
                      })}
                      fluid
                      type='number'
                      maxLength={5}
                      placeholder='8000'
                    />
                    <Panel.Error>{rowErrors?.targetPort?.message}</Panel.Error>
                  </label>
                  <label>
                    {getLocalizedString('settings.automations.automation_form.address')}
                    <Input {...register(`outputs.${index}.address`)} fluid placeholder='/cue/start' />
                    <Panel.Error>{rowErrors?.address?.message}</Panel.Error>
                  </label>
                  <label>
                    {getLocalizedString('settings.automations.automation_form.arguments')}
                    <TemplateInput {...register(`outputs.${index}.args`)} value={output.args} placeholder='1' />
                    <Panel.Error>{rowErrors?.args?.message}</Panel.Error>
                  </label>
                  <div>
                    <span>&nbsp;</span>
                    <Panel.InlineElements relation='inner'>
                      <Button variant='ghosted-white' onClick={() => handleTestOSCOutput(index)}>
                        {getLocalizedString('settings.automations.automation_form.test')}
                      </Button>
                      <IconButton
                        aria-label={getLocalizedString('settings.automations.automation_form.delete')}
                        variant='ghosted-destructive'
                        onClick={() => removeOutput(index)}
                      >
                        <IoTrash />
                      </IconButton>
                    </Panel.InlineElements>
                  </div>
                </div>
              </div>
            );
          }
          if (isHTTPOutput(output)) {
            const rowErrors = errors.outputs?.[index] as
              | {
                  url?: { message?: string };
                }
              | undefined;
            return (
              <div key={output.id} className={style.outputCard}>
                <Tag>HTTP</Tag>
                <div className={style.httpSection}>
                  <label>
                    {getLocalizedString('settings.automations.automation_form.target_url')}
                    <Input
                      {...register(`outputs.${index}.url`, {
                        required: {
                          value: true,
                          message: getLocalizedString('settings.automations.trigger_form.required_field'),
                        },
                        pattern: {
                          value: startsWithHttp,
                          message: getLocalizedString('settings.automations.automation_form.http_error'),
                        },
                      })}
                      fluid
                      placeholder='http://127.0.0.1/start/1'
                    />
                    <Panel.Error>{rowErrors?.url?.message}</Panel.Error>
                  </label>
                  <div>
                    <span>&nbsp;</span>
                    <Panel.InlineElements relation='inner'>
                      <Button variant='ghosted-white' onClick={() => handleTestHTTPOutput(index)}>
                        {getLocalizedString('settings.automations.automation_form.test')}
                      </Button>
                      <IconButton
                        aria-label={getLocalizedString('settings.automations.automation_form.delete')}
                        variant='ghosted-destructive'
                        onClick={() => removeOutput(index)}
                      >
                        <IoTrash />
                      </IconButton>
                    </Panel.InlineElements>
                  </div>
                </div>
              </div>
            );
          }

          if (isOntimeAction(output)) {
            const rowErrors = errors.outputs?.[index] as
              | {
                  action?: { message?: string };
                  time?: { message?: string };
                  text?: { message?: string };
                  visible?: { message?: string };
                  secondarySource?: { message?: string };
                }
              | undefined;
            return (
              <div key={output.id} className={style.outputCard}>
                <Tag>{getLocalizedString('settings.automations.automation_form.ontime_action_tag')}</Tag>
                <OntimeActionForm
                  value={output.action}
                  index={index}
                  register={register}
                  rowErrors={rowErrors}
                  setValue={setValue}
                  watch={watch}
                >
                  <span>&nbsp;</span>
                  <Panel.InlineElements relation='inner'>
                    <Button variant='ghosted-white' onClick={() => handleTestOntimeAction(index)}>
                      {getLocalizedString('settings.automations.automation_form.test')}
                    </Button>
                    <IconButton
                      aria-label={getLocalizedString('settings.automations.automation_form.delete')}
                      variant='ghosted-destructive'
                      onClick={() => removeOutput(index)}
                    >
                      <IoTrash />
                    </IconButton>
                  </Panel.InlineElements>
                </OntimeActionForm>
              </div>
            );
          }

          // there should be no other output types
          return null;
        })}
        <Panel.InlineElements relation='inner'>
          <Button onClick={handleAddNewOSCOutput}>
            OSC <IoAdd />
          </Button>
          <Button onClick={handleAddNewHTTPOutput}>
            HTTP <IoAdd />
          </Button>
          <Button onClick={handleAddnewOntimeAction}>
            {getLocalizedString('settings.automations.automation_form.ontime_action')} <IoAdd />
          </Button>
        </Panel.InlineElements>
      </div>

      <Panel.InlineElements align='end'>
        {errors?.root && <Panel.Error>{errors.root.message}</Panel.Error>}
        <Button onClick={onClose}>{getLocalizedString('settings.automations.automation_form.cancel')}</Button>
        <Button variant='primary' type='submit' disabled={!canSubmit} loading={isSubmitting}>
          {getLocalizedString('settings.save')}
        </Button>
      </Panel.InlineElements>
    </Panel.Indent>
  );
}
