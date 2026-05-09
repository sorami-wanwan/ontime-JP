import { useDisclosure } from '@mantine/hooks';
import { ViewSettings as ViewSettingsType } from 'ontime-types';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import { SwatchPickerRHF } from '../../../../common/components/input/colour-input/SwatchPicker';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import Switch from '../../../../common/components/switch/Switch';
import Tag from '../../../../common/components/tag/Tag';
import useViewSettings from '../../../../common/hooks-query/useViewSettings';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { useTranslation } from '../../../../translation/TranslationProvider';
import * as Panel from '../../panel-utils/PanelUtils';
import CodeEditorModal from './composite/StyleEditorModal';

const cssOverrideDocsUrl = 'https://docs.getontime.no/features/custom-styling/';

export default function ViewSettings() {
  const { getLocalizedString } = useTranslation();
  const { data, status, mutateAsync } = useViewSettings();
  const [isCodeEditorOpen, codeEditorHandler] = useDisclosure();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<ViewSettingsType>({
    defaultValues: data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  // update form if we get new data from server
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = async (formData: ViewSettingsType) => {
    try {
      mutateAsync(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    }
  };

  const onReset = () => {
    reset(data);
  };

  const overrideStylesEnabled = watch('overrideStyles');

  if (!control) {
    return null;
  }

  return (
    <Panel.Section
      as='form'
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => preventEscape(event, onReset)}
      id='view-settings'
    >
      <Panel.Card>
        <Panel.SubHeader>
          {getLocalizedString('settings.view.title')}
          <Panel.InlineElements>
            <Button disabled={!isDirty} variant='ghosted' onClick={onReset}>
              {getLocalizedString('settings.revert_to_saved')}
            </Button>
            <Button type='submit' loading={isSubmitting} disabled={!isDirty} variant='primary'>
              {getLocalizedString('settings.save')}
            </Button>
          </Panel.InlineElements>
        </Panel.SubHeader>
        <Panel.Divider />
        <Info>
          {getLocalizedString('settings.view.css_info')}
          <br />
          <ExternalLink href={cssOverrideDocsUrl}>{getLocalizedString('settings.view.see_docs')}</ExternalLink>
        </Info>
        <Panel.Section>
          <Panel.Loader isLoading={status === 'pending'} />
          <Panel.Error>{errors.root?.message}</Panel.Error>
          <Panel.ListGroup>
            <CodeEditorModal isOpen={isCodeEditorOpen} onClose={codeEditorHandler.close} />
            <Panel.ListItem>
              <Panel.Field
                title={
                  <>
                    <span>{getLocalizedString('settings.view.override_css')}</span>
                    {overrideStylesEnabled && <Tag variant='warning'>{getLocalizedString('settings.view.override_on')}</Tag>}
                  </>
                }
                description={
                  overrideStylesEnabled
                    ? getLocalizedString('settings.view.override_enabled')
                    : getLocalizedString('settings.view.override_disabled')
                }
                descriptionTone={overrideStylesEnabled ? 'warning' : 'default'}
              />
              <Switch
                size='large'
                checked={overrideStylesEnabled}
                onCheckedChange={(value: boolean) => setValue('overrideStyles', value, { shouldDirty: true })}
              />
              <Button onClick={codeEditorHandler.open} disabled={isSubmitting}>
                {getLocalizedString('settings.view.edit_css_override')}
              </Button>
            </Panel.ListItem>
          </Panel.ListGroup>
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field title={getLocalizedString('settings.view.timer_colour')} description={getLocalizedString('settings.view.timer_colour_description')} />
              <SwatchPickerRHF name='normalColor' control={control} />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title={getLocalizedString('settings.view.warning_colour')} description={getLocalizedString('settings.view.warning_colour_description')} />
              <SwatchPickerRHF name='warningColor' control={control} />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title={getLocalizedString('settings.view.danger_colour')} description={getLocalizedString('settings.view.danger_colour_description')} />
              <SwatchPickerRHF name='dangerColor' control={control} />
            </Panel.ListItem>
          </Panel.ListGroup>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}