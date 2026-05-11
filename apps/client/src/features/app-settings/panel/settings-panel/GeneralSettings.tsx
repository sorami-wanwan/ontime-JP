import { useDisclosure } from '@mantine/hooks';
import { Settings } from 'ontime-types';
import { lazy, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { postSettings } from '../../../../common/api/settings';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Select from '../../../../common/components/select/Select';
import useSettings from '../../../../common/hooks-query/useSettings';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../translation/TranslationProvider';
import * as Panel from '../../panel-utils/PanelUtils';
import GeneralPinInput from './composite/GeneralPinInput';

const TranslationModal = lazy(() => import('./composite/CustomTranslationModal'));

export default function GeneralSettings() {
  const { getLocalizedString } = useTranslation();
  const { data, status, refetch } = useSettings();
  const {
    handleSubmit,
    register,
    reset,
    setError,
    watch,
    setValue,
    formState: { isSubmitting, isDirty, isValid, errors },
  } = useForm<Settings>({
    mode: 'onChange',
    defaultValues: data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const [isOpen, handler] = useDisclosure();

  // update form if we get new data from server
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = async (formData: Settings) => {
    try {
      await postSettings(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    } finally {
      await refetch();
    }
  };

  const disableInputs = status === 'pending';
  const disableSubmit = isSubmitting || !isDirty || !isValid;
  const submitError = '';

  const onReset = () => {
    reset(data);
  };

  const isLoading = status === 'pending';

  return (
    <>
      <TranslationModal isOpen={isOpen} onClose={handler.close} />
      <Panel.Section
        as='form'
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => preventEscape(event, onReset)}
        id='app-settings'
      >
        <Panel.Card>
          <Panel.SubHeader>
            {getLocalizedString('settings.general.title')}
            <Panel.InlineElements>
              <Button disabled={!isDirty || isSubmitting} variant='ghosted' onClick={onReset}>
                {getLocalizedString('settings.revert_to_saved')}
              </Button>
              <Button
                type='submit'
                form='app-settings'
                name='general-settings-submit'
                loading={isSubmitting}
                disabled={disableSubmit}
                variant='primary'
              >
                {getLocalizedString('settings.save')}
              </Button>
            </Panel.InlineElements>
          </Panel.SubHeader>
          {submitError && <Panel.Error>{submitError}</Panel.Error>}
          <Panel.Divider />
          <Panel.Section>
            <Info>{getLocalizedString('settings.general.language_info')}</Info>
            <Panel.Loader isLoading={isLoading} />
            <Panel.ListGroup>
              <Panel.ListItem>
                <Panel.Field
                  title={getLocalizedString('settings.general.editor_pin_code')}
                  description={getLocalizedString('settings.general.editor_pin_code_description')}
                  error={errors.editorKey?.message}
                />
                <GeneralPinInput register={register} formName='editorKey' disabled={disableInputs} />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title={getLocalizedString('settings.general.operator_pin_code')}
                  description={getLocalizedString('settings.general.operator_pin_code_description')}
                  error={errors.operatorKey?.message}
                />
                <GeneralPinInput register={register} formName='operatorKey' disabled={disableInputs} />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title={getLocalizedString('settings.general.time_format')}
                  description={getLocalizedString('settings.general.time_format_description')}
                  error={errors.timeFormat?.message}
                />
                <Select
                  value={watch('timeFormat')}
                  onValueChange={(value: '12' | '24' | null) => {
                    if (value === null) return;
                    setValue('timeFormat', value, { shouldDirty: true });
                  }}
                  defaultValue='24'
                  options={[
                    { value: '12', label: getLocalizedString('settings.general.time_format_12') },
                    { value: '24', label: getLocalizedString('settings.general.time_format_24') },
                  ]}
                />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title={getLocalizedString('settings.general.views_language')}
                  description={getLocalizedString('settings.general.views_language_description')}
                  error={errors.language?.message}
                />
                <Select
                  value={watch('language')}
                  onValueChange={(value: string | null) => {
                    if (value === null) return;
                    setValue('language', value, { shouldDirty: true });
                  }}
                  disabled={disableInputs}
                  defaultValue='en'
                  options={[
                    { value: 'en', label: getLocalizedString('settings.general.language.en') },
                    { value: 'fr', label: getLocalizedString('settings.general.language.fr') },
                    { value: 'de', label: getLocalizedString('settings.general.language.de') },
                    { value: 'it', label: getLocalizedString('settings.general.language.it') },
                    { value: 'ja', label: getLocalizedString('settings.general.language.ja') },
                    { value: 'pt', label: getLocalizedString('settings.general.language.pt') },
                    { value: 'es', label: getLocalizedString('settings.general.language.es') },
                    { value: 'custom', label: getLocalizedString('settings.general.language.custom') },
                  ]}
                />
                <Button onClick={handler.open}>{getLocalizedString('settings.general.edit_custom_translation')}</Button>
              </Panel.ListItem>
            </Panel.ListGroup>
          </Panel.Section>
        </Panel.Card>
      </Panel.Section>
    </>
  );
}
