import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PROJECT_DATA } from '../../../../common/api/constants';
import { getDb, patchData } from '../../../../common/api/db';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Switch from '../../../../common/components/switch/Switch';
import { cx } from '../../../../common/utils/styleUtils';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import { makeProjectPatch } from './project.utils';

import style from './ProjectPanel.module.scss';

interface ProjectMergeFromProps {
  onClose: () => void;
  fileName: string;
}

type ProjectMergeFormValues = {
  project: boolean;
  rundowns: boolean;
  viewSettings: boolean;
  urlPresets: boolean;
  automation: boolean;
};

export default function ProjectMergeForm({ onClose, fileName }: ProjectMergeFromProps) {
  const { getLocalizedString } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<ProjectMergeFormValues>({
    defaultValues: {
      project: false,
      rundowns: false,
      viewSettings: false,
      urlPresets: false,
      automation: false,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const handleSubmitCreate = async (values: ProjectMergeFormValues) => {
    const allFalse = Object.values(values).every((value) => !value);
    if (allFalse) {
      setError(getLocalizedString('settings.project.merge.at_least_one_option'));
      return;
    }

    try {
      setError(null);

      // make patch object
      const { data } = await getDb(fileName);
      if (!data.settings.version.startsWith('4.')) {
        setError(getLocalizedString('settings.project.merge.older_version_error'));
        return;
      }
      const patch = await makeProjectPatch(data, values);

      // request patch
      await patchData(patch);
      await queryClient.invalidateQueries({ queryKey: PROJECT_DATA });
      onClose();
    } catch (error) {
      setError(maybeAxiosError(error));
    }
  };

  return (
    <Panel.Section as='form' onSubmit={handleSubmit(handleSubmitCreate)}>
      <Panel.Title>
        {getLocalizedString('settings.project.merge.title')}
        <Panel.InlineElements>
          <Button onClick={onClose} variant='ghosted' disabled={isSubmitting}>
            {getLocalizedString('settings.project.merge.cancel')}
          </Button>
          <Button type='submit' disabled={!isValid || !isDirty} loading={isSubmitting} variant='primary'>
            {getLocalizedString('settings.project.merge.submit')}
          </Button>
        </Panel.InlineElements>
      </Panel.Title>
      {error && <Panel.Error>{error}</Panel.Error>}
      <Panel.Section className={cx([style.innerColumn, style.inlineLabels])}>
        <Panel.Description>
          <span
            dangerouslySetInnerHTML={{
              __html: getLocalizedString('settings.project.merge.description').replace('{{0}}', fileName),
            }}
          />
        </Panel.Description>
        <Info type='warning'>
          {getLocalizedString('settings.project.merge.warning_1')} <br />
          {getLocalizedString('settings.project.merge.warning_2')}
        </Info>
        <label>
          <Switch
            size='large'
            checked={watch('project')}
            onCheckedChange={(value: boolean) => setValue('project', value, { shouldDirty: true })}
          />
          {getLocalizedString('settings.project.merge.project_data')}
        </label>
        <label>
          <Switch
            size='large'
            checked={watch('rundowns')}
            onCheckedChange={(value: boolean) => setValue('rundowns', value, { shouldDirty: true })}
          />
          {getLocalizedString('settings.project.merge.rundown_custom_fields')}
        </label>
        <label>
          <Switch
            size='large'
            checked={watch('viewSettings')}
            onCheckedChange={(value: boolean) => setValue('viewSettings', value, { shouldDirty: true })}
          />
          {getLocalizedString('settings.project.merge.view_settings')}
        </label>
        <label>
          <Switch
            size='large'
            checked={watch('urlPresets')}
            onCheckedChange={(value: boolean) => setValue('urlPresets', value, { shouldDirty: true })}
          />
          {getLocalizedString('settings.project.merge.url_presets')}
        </label>
        <label>
          <Switch
            size='large'
            checked={watch('automation')}
            onCheckedChange={(value: boolean) => setValue('automation', value, { shouldDirty: true })}
          />
          {getLocalizedString('settings.project.merge.automation_settings')}
        </label>
      </Panel.Section>
    </Panel.Section>
  );
}
