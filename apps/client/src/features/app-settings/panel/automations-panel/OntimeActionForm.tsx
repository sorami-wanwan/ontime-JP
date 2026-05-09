import { AutomationDTO, OntimeAction, OntimeActionKey, SecondarySource } from 'ontime-types';
import { PropsWithChildren, useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

import Input from '../../../../common/components/input/input/Input';
import Select from '../../../../common/components/select/Select';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';

import style from './AutomationForm.module.scss';

interface OntimeActionFormProps {
  index: number;
  register: UseFormRegister<AutomationDTO>;
  rowErrors?: {
    action?: { message?: string };
    time?: { message?: string };
    text?: { message?: string };
    visible?: { message?: string };
    secondarySource?: { message?: string };
  };
  value: OntimeAction['action'];
  watch: UseFormWatch<AutomationDTO>;
  setValue: UseFormSetValue<AutomationDTO>;
}

export default function OntimeActionForm({
  index,
  register,
  setValue,
  rowErrors,
  value,
  children,
  watch,
}: PropsWithChildren<OntimeActionFormProps>) {
  const { getLocalizedString } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<string>(value);

  const handleSetAction = (value: OntimeActionKey) => {
    setValue(`outputs.${index}.action`, value, { shouldDirty: true });
    setSelectedAction(value);
  };

  return (
    <div className={style.actionSection}>
      <label>
        {getLocalizedString('settings.automations.ontime_action_form.action')}
        <Select
          onValueChange={(value: OntimeActionKey | null) => {
            if (value === null) return;
            handleSetAction(value);
          }}
          value={watch(`outputs.${index}.action`)}
          options={[
            {
              value: 'aux1-pause',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux1_pause'),
            },
            {
              value: 'aux2-pause',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux2_pause'),
            },
            {
              value: 'aux3-pause',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux3_pause'),
            },

            {
              value: 'aux1-start',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux1_start'),
            },
            {
              value: 'aux2-start',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux2_start'),
            },
            {
              value: 'aux3-start',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux3_start'),
            },

            {
              value: 'aux1-stop',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux1_stop'),
            },
            {
              value: 'aux2-stop',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux2_stop'),
            },
            {
              value: 'aux3-stop',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux3_stop'),
            },

            {
              value: 'aux1-set',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux1_set'),
            },
            {
              value: 'aux2-set',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux2_set'),
            },
            {
              value: 'aux3-set',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.aux3_set'),
            },

            {
              value: 'playback-start',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.playback_start'),
            },
            {
              value: 'playback-stop',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.playback_stop'),
            },
            {
              value: 'playback-pause',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.playback_pause'),
            },
            {
              value: 'playback-roll',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.playback_roll'),
            },

            {
              value: 'message-set',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.message_set'),
            },
            {
              value: 'message-secondary',
              label: getLocalizedString('settings.automations.ontime_action_form.actions.message_secondary'),
            },
          ]}
        />
        <Panel.Error>{rowErrors?.action?.message}</Panel.Error>
      </label>

      {selectedAction.startsWith('aux') && selectedAction.endsWith('set') && (
        <label>
          {getLocalizedString('settings.automations.ontime_action_form.new_time')}
          <Input
            {...register(`outputs.${index}.time`, {
              required: {
                value: true,
                message: getLocalizedString('settings.automations.trigger_form.required_field'),
              },
            })}
            fluid
            placeholder={getLocalizedString('settings.automations.ontime_action_form.new_time_placeholder')}
          />
          <Panel.Error>{rowErrors?.time?.message}</Panel.Error>
        </label>
      )}

      {selectedAction === 'message-set' && (
        <>
          <label>
            {getLocalizedString('settings.automations.ontime_action_form.text_empty')}
            <Input
              {...register(`outputs.${index}.text`)}
              fluid
              placeholder={getLocalizedString('settings.automations.ontime_action_form.text_placeholder')}
            />
            <Panel.Error>{rowErrors?.text?.message}</Panel.Error>
          </label>
          <label>
            {getLocalizedString('settings.automations.ontime_action_form.visibility')}
            <Select
              onValueChange={(value) => {
                // we need to translate the null to undefined so it becomes 'untouched'
                const translatedValue = value === null ? undefined : value;
                setValue(`outputs.${index}.visible`, translatedValue, { shouldDirty: true });
              }}
              value={watch(`outputs.${index}.visible`)}
              options={[
                {
                  value: null,
                  label: getLocalizedString('settings.automations.ontime_action_form.visibility_untouched'),
                },
                { value: true, label: getLocalizedString('settings.automations.ontime_action_form.visibility_show') },
                { value: false, label: getLocalizedString('settings.automations.ontime_action_form.visibility_hide') },
              ]}
            />
            <Panel.Error>{rowErrors?.visible?.message}</Panel.Error>
          </label>
        </>
      )}

      {selectedAction === 'message-secondary' && (
        <label>
          {getLocalizedString('settings.automations.ontime_action_form.timer_secondary_source')}
          <Select<SecondarySource | 'null' | null>
            onValueChange={(value) => {
              // null -> no selection
              if (value === null) return;
              // 'null' -> clear the secondary source
              if (value === 'null') {
                setValue(`outputs.${index}.secondarySource`, null, { shouldDirty: true });
                return;
              }
              setValue(`outputs.${index}.secondarySource`, value, { shouldDirty: true });
            }}
            value={watch(`outputs.${index}.secondarySource`)}
            options={[
              {
                value: null,
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.select'),
              },
              {
                value: 'aux1',
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.aux1'),
              },
              {
                value: 'aux2',
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.aux2'),
              },
              {
                value: 'aux3',
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.aux3'),
              },
              {
                value: 'secondary',
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.secondary'),
              },
              {
                value: 'null',
                label: getLocalizedString('settings.automations.ontime_action_form.secondary_source.none'),
              }, // allow the user to clear the secondary source
            ]}
          />
          <Panel.Error>{rowErrors?.secondarySource?.message}</Panel.Error>
        </label>
      )}

      <div className={style.test}>{children}</div>
    </div>
  );
}
