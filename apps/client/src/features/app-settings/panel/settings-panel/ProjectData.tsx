import { type ProjectData } from 'ontime-types';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { IoAdd, IoDownloadOutline, IoTrash } from 'react-icons/io5';

import { projectLogoPath } from '../../../../common/api/constants';
import { uploadProjectLogo } from '../../../../common/api/project';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Input from '../../../../common/components/input/input/Input';
import Textarea from '../../../../common/components/input/textarea/Textarea';
import useProjectData, { useUpdateProjectData } from '../../../../common/hooks-query/useProjectData';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { validateLogo } from '../../../../common/utils/uploadUtils';
import { documentationUrl } from '../../../../externals';
import { useTranslation } from '../../../../translation/TranslationProvider';
import * as Panel from '../../panel-utils/PanelUtils';

import style from './SettingsPanel.module.scss';

export default function ProjectData() {
  const { getLocalizedString } = useTranslation();
  const { data, status } = useProjectData();
  const { updateProjectData } = useUpdateProjectData();

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, isValid, isDirty, errors },
    setError,
    clearErrors,
    watch,
    control,
    setValue,
  } = useForm({
    defaultValues: data,
    resetOptions: {
      keepDirtyValues: true,
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom',
  });

  // reset form values if data changes
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const handleUploadProjectLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    clearErrors('logo');

    if (!file) {
      return;
    }

    try {
      validateLogo(file);
      const response = await uploadProjectLogo(file);

      setValue('logo', response.data.logoFilename, {
        shouldDirty: true,
      });
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('logo', { message });
    }
  };

  const { ref, ...projectLogoRest } = register('logo');

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleClickUpload = () => {
    uploadInputRef.current?.click();
  };

  const handleDeleteLogo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('logo', null, {
      shouldDirty: true,
    });
  };

  const handleAddCustom = () => {
    append({ title: '', value: '', url: '' });
  };

  const onSubmit = async (formData: ProjectData) => {
    try {
      clearErrors();
      await updateProjectData(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    }
  };

  // reset data to the initial state
  const onReset = () => {
    reset(data);
  };

  const isLoading = status === 'pending';

  return (
    <Panel.Section as='form' onSubmit={handleSubmit(onSubmit)} onKeyDown={(event) => preventEscape(event, onReset)}>
      <Panel.Card>
        <Panel.SubHeader>
          {getLocalizedString('settings.project.title')}
          <Panel.InlineElements>
            <Button onClick={onReset} disabled={isSubmitting || !isDirty}>
              {getLocalizedString('settings.revert_to_saved')}
            </Button>
            <Button variant='primary' type='submit' disabled={!isDirty || !isValid} loading={isSubmitting}>
              {getLocalizedString('settings.save')}
            </Button>
          </Panel.InlineElements>
        </Panel.SubHeader>
        <Panel.Divider />
        <Panel.Section>
          <Panel.Loader isLoading={isLoading} />
          <label>
            {getLocalizedString('settings.project.project_title')}
            <Input
              fluid
              maxLength={50}
              placeholder={getLocalizedString('settings.project.project_title_placeholder')}
              {...register('title')}
            />
          </label>
          <Panel.Section style={{ marginTop: 0 }}>
            <label>
              {getLocalizedString('settings.project.project_logo')}
              <input
                type='file'
                style={{ display: 'none' }}
                accept='image/*'
                {...projectLogoRest}
                ref={(e) => {
                  ref(e);
                  uploadInputRef.current = e;
                }}
                onChange={handleUploadProjectLogo}
              />
              <Panel.Card className={style.uploadLogoCard}>
                {watch('logo') ? (
                  <>
                    <img src={`${projectLogoPath}/${watch('logo')}`} />
                    <Button
                      variant='subtle-destructive'
                      disabled={isSubmitting || !watch('logo')}
                      onClick={handleDeleteLogo}
                    >
                      <IoTrash />
                      {getLocalizedString('settings.project.delete')}
                    </Button>
                  </>
                ) : (
                  <Button disabled={isSubmitting} onClick={handleClickUpload} type='button'>
                    <IoDownloadOutline />
                    {getLocalizedString('settings.project.upload_logo')}
                  </Button>
                )}
                {errors?.logo?.message && <Panel.Error>{errors.logo.message}</Panel.Error>}
              </Panel.Card>
            </label>
          </Panel.Section>

          <label>
            {getLocalizedString('settings.project.project_description')}
            <Input
              fluid
              maxLength={100}
              placeholder={getLocalizedString('settings.project.project_description_placeholder')}
              {...register('description')}
            />
          </label>
          <label>
            {getLocalizedString('settings.project.project_info')}
            <Textarea
              fluid
              maxLength={150}
              placeholder={getLocalizedString('settings.project.project_info_placeholder')}
              resize='vertical'
              {...register('info')}
            />
          </label>
          <label>
            {getLocalizedString('settings.project.project_qr_url')}
            <Input fluid placeholder={documentationUrl} {...register('url')} />
          </label>
          <Panel.Section style={{ marginTop: 0 }}>
            <Panel.ListItem>
              <Panel.Field title={getLocalizedString('settings.project.custom_data')} description='' />
              <Button onClick={handleAddCustom}>
                {getLocalizedString('settings.project.add')} <IoAdd />
              </Button>
            </Panel.ListItem>
            {fields.length > 0 &&
              fields.map((field, idx) => {
                const rowErrors = errors.custom?.[idx] as
                  | {
                      title?: { message?: string };
                      value?: { message?: string };
                    }
                  | undefined;
                return (
                  <div key={field.id} className={style.customDataItem}>
                    <div className={style.titleRow}>
                      <label className={style.title}>
                        {getLocalizedString('settings.project.custom_title')}
                        <Input
                          fluid
                          defaultValue={field.title}
                          placeholder={getLocalizedString('settings.project.custom_title_placeholder')}
                          {...register(`custom.${idx}.title`, {
                            required: { value: true, message: getLocalizedString('settings.project.field_required') },
                          })}
                        />
                      </label>
                      <Button variant='subtle-destructive' onClick={() => remove(idx)}>
                        <IoTrash />
                        {getLocalizedString('settings.project.delete')}
                      </Button>
                    </div>
                    {rowErrors?.title?.message && <Panel.Error>{rowErrors.title.message}</Panel.Error>}
                    <label>
                      {getLocalizedString('settings.project.custom_text')}
                      <Textarea
                        fluid
                        rows={3}
                        resize='vertical'
                        defaultValue={field.value}
                        placeholder={getLocalizedString('settings.project.custom_text_placeholder')}
                        {...register(`custom.${idx}.value`, {
                          required: { value: true, message: getLocalizedString('settings.project.field_required') },
                        })}
                      />
                      {rowErrors?.value?.message && <Panel.Error>{rowErrors.value.message}</Panel.Error>}
                    </label>
                    <label>
                      {getLocalizedString('settings.project.image_url')}
                      <div className={style.customImage}>
                        <Input
                          fluid
                          defaultValue={field.url}
                          placeholder={getLocalizedString('settings.project.image_url_placeholder')}
                          {...register(`custom.${idx}.url`)}
                        />
                        <div className={style.imageContainer}>
                          {watch(`custom.${idx}.url`) && (
                            <img src={watch(`custom.${idx}.url`)} alt='' loading='lazy' className='info__image' />
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
          </Panel.Section>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
