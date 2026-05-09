import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Input from '../../../../common/components/input/input/Input';
import useServerPort from '../../../../common/hooks-query/useServerPort';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { isOnlyNumbers } from '../../../../common/utils/regex';
import { useTranslation } from '../../../../translation/TranslationProvider';
import * as Panel from '../../panel-utils/PanelUtils';

interface ServerPortForm {
  serverPort: number;
}

export default function ServerPortSettings() {
  const { getLocalizedString } = useTranslation();
  const { data, status, isError, refetch, mutateAsync } = useServerPort();
  const {
    handleSubmit,
    register,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting, isDirty, isValid, errors },
  } = useForm<ServerPortForm>({
    mode: 'onChange',
    defaultValues: { serverPort: 4001 },
  });

  useEffect(() => {
    reset({ serverPort: data.port });
  }, [data.pendingRestart, data.port, reset]);

  const onSubmit = async (formData: ServerPortForm) => {
    if (formData.serverPort < 1024 || formData.serverPort > 65535) {
      setError('serverPort', { message: getLocalizedString('settings.port.port_range') });
      return;
    }
    try {
      clearErrors('root');
      await mutateAsync(formData.serverPort);
    } catch (error) {
      setError('root', { message: maybeAxiosError(error) });
    }
  };

  const onReset = async () => {
    clearErrors('root');
    const result = await refetch();

    if (result.isError) {
      setError('root', { message: getLocalizedString('settings.port.load_failed') });
      return;
    }

    reset({ serverPort: result.data?.port ?? data.port });
  };

  const rootError = isError ? getLocalizedString('settings.port.load_failed') : errors.root?.message;

  return (
    <Panel.Section
      as='form'
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => preventEscape(event, onReset)}
      id='server-port-settings'
    >
      <Panel.Card>
        <Panel.SubHeader>
          {getLocalizedString('settings.port.title')}
          <Panel.InlineElements>
            <Button disabled={!isDirty || isSubmitting} variant='ghosted' onClick={onReset}>
              {getLocalizedString('settings.revert_to_saved')}
            </Button>
            <Button
              type='submit'
              form='server-port-settings'
              name='server-port-settings-submit'
              loading={isSubmitting}
              disabled={!isDirty || !isValid || isSubmitting}
              variant='primary'
            >
              {getLocalizedString('settings.save')}
            </Button>
          </Panel.InlineElements>
        </Panel.SubHeader>
        <Panel.Loader isLoading={status === 'pending'} />
        {rootError && <Panel.Error>{rootError}</Panel.Error>}
        <Panel.Divider />
        <Panel.Section>
          {data.pendingRestart && (
            <Info type='warning'>{getLocalizedString('settings.port.pending_restart')}</Info>
          )}
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field
                title={getLocalizedString('settings.port.server_port')}
                description={getLocalizedString('settings.port.server_port_description')}
                error={errors.serverPort?.message}
              />
              <Input
                id='serverPort'
                type='number'
                maxLength={5}
                style={{ width: '75px' }}
                {...register('serverPort', {
                  required: { value: true, message: getLocalizedString('settings.port.required') },
                  max: { value: 65535, message: getLocalizedString('settings.port.port_range') },
                  min: { value: 1024, message: getLocalizedString('settings.port.port_range') },
                  pattern: {
                    value: isOnlyNumbers,
                    message: getLocalizedString('settings.port.numeric'),
                  },
                })}
              />
            </Panel.ListItem>
          </Panel.ListGroup>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}