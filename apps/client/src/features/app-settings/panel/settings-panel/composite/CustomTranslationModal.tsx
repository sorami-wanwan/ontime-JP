import { TranslationObject, langEn } from 'ontime-types';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { maybeAxiosError } from '../../../../../common/api/utils';
import Button from '../../../../../common/components/buttons/Button';
import Info from '../../../../../common/components/info/Info';
import Input from '../../../../../common/components/input/input/Input';
import Modal from '../../../../../common/components/modal/Modal';
import { useTranslation } from '../../../../../translation/TranslationProvider';
import * as Panel from '../../../panel-utils/PanelUtils';

interface CustomTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomTranslationModal({ isOpen, onClose }: CustomTranslationModalProps) {
  const { userTranslation, postUserTranslation, getLocalizedString } = useTranslation();

  const defaultValues = useMemo(() => {
    const values: Record<string, string> = {};
    Object.keys(langEn).forEach((key) => {
      values[toFormKey(key)] = userTranslation[key as keyof TranslationObject] || '';
    });
    return values;
  }, [userTranslation]);

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, isDirty, errors, isValid },
    setError,
  } = useForm({
    defaultValues,
    resetOptions: {
      keepDirtyValues: true,
    },
    mode: 'onChange',
  });

  const onSubmit = async (formData: Record<string, string>) => {
    try {
      const translationData: Record<string, string> = {};
      Object.keys(formData).forEach((key) => {
        translationData[toApiKey(key)] = formData[key];
      });

      await postUserTranslation(translationData as TranslationObject);
      reset(formData);
    } catch (error) {
      setError('root', { message: maybeAxiosError(error) });
    }
  };

  return (
    <Modal
      title={getLocalizedString('settings.general.custom_translation.title')}
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      showBackdrop
      bodyElements={
        <Panel.Section as='form' onSubmit={handleSubmit(onSubmit)} id='custom-translations-form'>
          <Info>
            {getLocalizedString('settings.general.custom_translation.info_line1')}
            <br />
            {getLocalizedString('settings.general.custom_translation.info_line2')}
          </Info>
          <Panel.ListGroup>
            {Object.entries(langEn).map(([key, value]) => (
              <Panel.ListItem key={key}>
                <Panel.Field title={value} description='' error={errors[toFormKey(key)]?.message} />
                <Input
                  maxLength={150}
                  {...register(toFormKey(key), {
                    required: getLocalizedString('settings.project.field_required'),
                  })}
                  placeholder={value}
                />
              </Panel.ListItem>
            ))}
          </Panel.ListGroup>
        </Panel.Section>
      }
      footerElements={
        <div>
          {errors?.root && <Panel.Error>{errors.root.message}</Panel.Error>}
          <Panel.InlineElements align='apart'>
            <Panel.InlineElements>
              <Button size='large' onClick={onClose}>
                {getLocalizedString('common.cancel')}
              </Button>
              <Button
                variant='primary'
                size='large'
                type='submit'
                form='custom-translations-form'
                disabled={isSubmitting || !isDirty || !isValid}
                loading={isSubmitting}
              >
                {getLocalizedString('common.save_changes')}
              </Button>
            </Panel.InlineElements>
          </Panel.InlineElements>
        </div>
      }
    />
  );
}

function toFormKey(key: string) {
  return key.replace('.', '_');
}

function toApiKey(key: string) {
  return key.replace('_', '.');
}
