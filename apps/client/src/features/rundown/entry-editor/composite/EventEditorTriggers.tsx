import { NormalisedAutomation, TimerLifeCycle, Trigger, timerLifecycleValues } from 'ontime-types';
import { generateId } from 'ontime-utils';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { IoAlertCircle, IoCheckmarkCircle, IoTrash } from 'react-icons/io5';

import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import * as Editor from '../../../../common/components/editor-utils/EditorUtils';
import Info from '../../../../common/components/info/Info';
import Select from '../../../../common/components/select/Select';
import { useEntryActionsContext } from '../../../../common/context/EntryActionsContext';
import useAutomationSettings from '../../../../common/hooks-query/useAutomationSettings';
import { useTranslation } from '../../../../translation/useTranslation';
import { eventTriggerOptions } from './eventTrigger.constants';

import style from './EventEditorTriggers.module.scss';

interface EventEditorTriggersProps {
  eventId: string;
  triggers: Trigger[];
}

export default function EventEditorTriggers({ triggers, eventId }: EventEditorTriggersProps) {
  const { data: automationSettings, status: automationStatus } = useAutomationSettings();
  const { getLocalizedString } = useTranslation();
  const automationsEnabled = automationStatus === 'pending' ? undefined : automationSettings.enabledAutomations;
  const showTriggers = triggers.length > 0;

  return (
    <div className={style.triggers}>
      {automationsEnabled === false && <Info>{getLocalizedString('rundown.editor.automations_disabled')}</Info>}
      {showTriggers && (
        <div className={style.section}>
          <div className={style.sectionTitle}>{getLocalizedString('rundown.editor.applied_automations')}</div>
          <ExistingEventTriggers triggers={triggers} eventId={eventId} automations={automationSettings.automations} />
        </div>
      )}
      <Editor.Panel className={style.formSection}>
        <div className={style.sectionTitle}>{getLocalizedString('rundown.editor.add_automation')}</div>
        <EventTriggerForm triggers={triggers} eventId={eventId} automations={automationSettings.automations} />
      </Editor.Panel>
    </div>
  );
}

interface EventTriggerFormProps {
  eventId: string;
  triggers?: Trigger[];
  automations: NormalisedAutomation;
}

function EventTriggerForm({ eventId, triggers, automations }: EventTriggerFormProps) {
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();
  const [automationId, setAutomationId] = useState<string | undefined>(undefined);
  const [cycleValue, setCycleValue] = useState(TimerLifeCycle.onStart);

  const handleSubmit = (triggerLifeCycle: TimerLifeCycle, automationId: string) => {
    const newTriggers = triggers ?? new Array<Trigger>();
    const id = generateId();
    newTriggers.push({ id, title: '', trigger: triggerLifeCycle, automationId });
    updateEntry({ id: eventId, triggers: newTriggers });
  };

  const getValidationError = (cycle: TimerLifeCycle, automationId?: string): string | undefined => {
    if (automationId === undefined) {
      return getLocalizedString('rundown.editor.validation_select_automation');
    }
    if (!Object.keys(automations).includes(automationId)) {
      return getLocalizedString('rundown.editor.validation_automation_not_exist');
    }
    if (triggers === undefined) {
      return;
    }
    return Object.values(triggers).some((t) => t.automationId === automationId && t.trigger === cycle)
      ? getLocalizedString('rundown.editor.validation_automation_used')
      : undefined;
  };

  const validationError = getValidationError(cycleValue, automationId);
  const validationLabel = validationError ?? getLocalizedString('rundown.editor.validation_ready_to_add');

  const triggerOptions = useMemo(
    () => [
      { value: null, label: getLocalizedString('rundown.editor.select_lifecycle') },
      ...eventTriggerOptions.map((cycle) => ({ value: cycle, label: cycle })),
    ],
    [getLocalizedString], // eventTriggerOptions is a constant, getLocalizedString is needed as dependency
  );

  const automationOptions = useMemo(
    () => [
      { value: null, label: getLocalizedString('rundown.editor.select_automation') },
      ...Object.values(automations).map(({ id, title }) => ({ value: id, label: title })),
    ],
    [automations, getLocalizedString], // This needs to be a dependency as it can change
  );

  return (
    <div className={style.triggerForm}>
      <div className={style.formFields}>
        <div>
          <Editor.Label>{getLocalizedString('rundown.editor.lifecycle')}</Editor.Label>
          <Select
            value={cycleValue}
            onValueChange={(value) => {
              if (value !== null) setCycleValue(value);
            }}
            options={triggerOptions}
          />
        </div>

        <div>
          <Editor.Label>{getLocalizedString('rundown.editor.automation')}</Editor.Label>
          <Select
            value={automationId ?? null}
            onValueChange={(value) => {
              if (value !== null) setAutomationId(value);
            }}
            options={automationOptions}
          />
        </div>
      </div>

      <div className={style.formActions}>
        <div className={validationError ? style.validationError : style.validationSuccess}>
          {validationError ? <IoAlertCircle /> : <IoCheckmarkCircle />}
          <span>{validationLabel}</span>
        </div>
        <Button
          disabled={validationError !== undefined}
          onClick={() => automationId && handleSubmit(cycleValue, automationId)}
        >
          {getLocalizedString('rundown.editor.add_automation')}
        </Button>
      </div>
    </div>
  );
}

interface ExistingEventTriggersProps {
  eventId: string;
  triggers: Trigger[];
  automations: NormalisedAutomation;
}

function ExistingEventTriggers({ eventId, triggers, automations }: ExistingEventTriggersProps) {
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  const handleDelete = useCallback(
    (triggerId: string) => {
      const newTriggers = triggers.filter((trigger) => trigger.id !== triggerId);
      updateEntry({ id: eventId, triggers: newTriggers });
    },
    [eventId, triggers, updateEntry],
  );

  const filteredTriggers: Record<string, Trigger[]> = {};

  // sort triggers out into groups by the Lifecycle they are on
  timerLifecycleValues.forEach((triggerType) => {
    const thisTriggerType = triggers.filter((trigger) => trigger.trigger === triggerType);
    if (thisTriggerType.length) {
      Object.assign(filteredTriggers, { [triggerType]: thisTriggerType });
    }
  });

  return (
    <div className={style.triggerList}>
      {Object.entries(filteredTriggers).map(([triggerLifeCycle, triggerGroup]) => (
        <Fragment key={triggerLifeCycle}>
          {triggerGroup.map((trigger) => {
            const { id, automationId } = trigger;
            const automationTitle =
              automations[automationId]?.title ?? getLocalizedString('rundown.editor.missing_automation');
            return (
              <div key={id} className={style.trigger}>
                <div className={style.triggerMeta}>
                  <div className={style.metaLabel}>{getLocalizedString('rundown.editor.lifecycle')}</div>
                  <div>{triggerLifeCycle}</div>
                </div>
                <div className={style.triggerMeta}>
                  <div className={style.metaLabel}>{getLocalizedString('rundown.editor.automation')}</div>
                  <div className={style.automationTitle}>{automationTitle}</div>
                </div>
                <IconButton variant='ghosted-destructive' onClick={() => handleDelete(id)}>
                  <IoTrash />
                </IconButton>
              </div>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
