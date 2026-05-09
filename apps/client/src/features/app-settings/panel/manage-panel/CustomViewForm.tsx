import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { IoCloudUploadOutline } from 'react-icons/io5';

import { uploadCustomView } from '../../../../common/api/customViews';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Input from '../../../../common/components/input/input/Input';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import { getFileError, getSlugError, getViewUrl, maxUploadLabel } from './customViews.utils';

import style from './CustomViews.module.scss';

interface CustomViewFormProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function CustomViewForm({ onComplete, onClose }: CustomViewFormProps) {
  const [slug, setSlug] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);
  const [fileDirty, setFileDirty] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { getLocalizedString } = useTranslation();

  const normalisedSlug = useMemo(() => slug.trim().toLowerCase(), [slug]);
  const previewUrl = getViewUrl(normalisedSlug);
  const slugError = useMemo(() => getSlugError(normalisedSlug), [normalisedSlug]);
  const fileError = useMemo(() => getFileError(selectedFile), [selectedFile]);
  const canUpload = Boolean(normalisedSlug && selectedFile) && !slugError && !fileError && !isUploading;

  const handleSelectFile = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setFileDirty(true);
    setError(null);
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedFile || slugError || fileError) return;

    try {
      setIsUploading(true);
      setError(null);
      await uploadCustomView(normalisedSlug, selectedFile);
      onComplete();
    } catch (err) {
      setError(maybeAxiosError(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Panel.Indent as='form' onSubmit={handleUpload} className={style.uploadForm}>
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type='file'
        onChange={handleSelectFile}
        accept='.html,text/html'
      />

      <div className={style.step}>
        <div className={style.stepTitle}>{getLocalizedString('settings.manage.custom_views.step_1')}</div>
        <Panel.Description>{getLocalizedString('settings.manage.custom_views.name')}</Panel.Description>
        <Input
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
            setSlugDirty(true);
          }}
          placeholder='my-view'
          aria-label={getLocalizedString('settings.manage.custom_views.name_aria')}
          autoCapitalize='off'
          autoComplete='off'
          fluid
        />
        <Panel.Description>
          {getLocalizedString('settings.manage.custom_views.name_desc')} <Panel.Highlight>my-view</Panel.Highlight>
        </Panel.Description>
        <Panel.Description>
          {getLocalizedString('settings.manage.custom_views.preview_url')}{' '}
          <Panel.Highlight>{previewUrl}</Panel.Highlight>
        </Panel.Description>
        {slugDirty && slugError && <Panel.Error>{slugError}</Panel.Error>}
      </div>

      <div className={style.step}>
        <div className={style.stepTitle}>{getLocalizedString('settings.manage.custom_views.step_2')}</div>
        <Panel.Description>{getLocalizedString('settings.manage.custom_views.upload_file')}</Panel.Description>
        <Panel.InlineElements wrap='wrap' className={style.filePicker}>
          <Button onClick={() => fileInputRef.current?.click()}>
            {selectedFile
              ? getLocalizedString('settings.manage.custom_views.replace_html')
              : getLocalizedString('settings.manage.custom_views.choose_html')}
          </Button>
          <span className={style.fileName}>
            {selectedFile
              ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} ${getLocalizedString('settings.manage.custom_views.kb')})`
              : getLocalizedString('settings.manage.custom_views.no_file')}
          </span>
        </Panel.InlineElements>
        <Panel.Description>
          {getLocalizedString('settings.manage.custom_views.accepted_format')} {maxUploadLabel}.
        </Panel.Description>
        {fileDirty && fileError && <Panel.Error>{fileError}</Panel.Error>}
      </div>

      {error && <Panel.Error>{error}</Panel.Error>}

      <Panel.InlineElements align='end'>
        <Button onClick={onClose}>{getLocalizedString('common.cancel')}</Button>
        <Button variant='primary' type='submit' loading={isUploading} disabled={!canUpload}>
          {getLocalizedString('settings.manage.custom_views.upload_view')} <IoCloudUploadOutline />
        </Button>
      </Panel.InlineElements>
    </Panel.Indent>
  );
}
