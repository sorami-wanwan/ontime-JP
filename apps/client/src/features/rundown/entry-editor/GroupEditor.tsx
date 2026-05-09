import { MaybeNumber, OntimeGroup } from 'ontime-types';
import { millisToString } from 'ontime-utils';
import { useCallback } from 'react';

import * as Editor from '../../../common/components/editor-utils/EditorUtils';
import SwatchSelect from '../../../common/components/input/colour-input/SwatchSelect';
import AppLink from '../../../common/components/link/app-link/AppLink';
import { useEntryActionsContext } from '../../../common/context/EntryActionsContext';
import useCustomFields from '../../../common/hooks-query/useCustomFields';
import { getOffsetState } from '../../../common/utils/offset';
import { cx, enDash } from '../../../common/utils/styleUtils';
import { formatTime } from '../../../common/utils/time';
import { useTranslation } from '../../../translation/useTranslation';
import TextLikeInput from '../../../views/cuesheet/cuesheet-table/cuesheet-table-elements/TextLikeInput';
import EntryEditorCustomFields from './composite/EventEditorCustomFields';
import EventTextArea from './composite/EventTextArea';
import EntryEditorTextInput from './composite/EventTextInput';
import TargetDurationInput from './composite/TargetDurationInput';

import style from './EntryEditor.module.scss';

// title + colour + custom field labels
export type GroupEditorUpdateTextFields = 'title' | 'colour' | string;
export type GroupEditorUpdateMaybeNumberFields = 'targetDuration';

interface GroupEditorProps {
  group: OntimeGroup;
}

export default function GroupEditor({ group }: GroupEditorProps) {
  const { data: customFields } = useCustomFields();
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  const handleSubmit = useCallback(
    (field: GroupEditorUpdateTextFields | GroupEditorUpdateMaybeNumberFields, value: string | MaybeNumber) => {
      // Handle custom fields
      if (typeof field === 'string' && field.startsWith('custom-')) {
        const fieldLabel = field.split('custom-')[1];
        updateEntry({ id: group.id, custom: { [fieldLabel]: value as string } });
        return;
      }

      if (field === 'targetDuration') {
        return updateEntry({ id: group.id, targetDuration: value as MaybeNumber });
      }

      // all other strings are text fields
      return updateEntry({ id: group.id, [field]: value as string });
    },
    [group.id, updateEntry],
  );

  const isEditor = window.location.pathname.includes('editor');
  const planOffset = group.targetDuration === null ? null : group.duration - group.targetDuration;
  const planOffsetLabel = planOffset !== null ? getOffsetState(planOffset) : null;

  return (
    <div className={style.content}>
      <div className={style.column}>
        <Editor.Title>{getLocalizedString('rundown.editor.group_schedule')}</Editor.Title>
        <div className={style.inline}>
          <div>
            <Editor.Label>{getLocalizedString('rundown.editor.first_event_start')}</Editor.Label>
            <TextLikeInput className={style.textLikeInput} disabled>
              {formatTime(group.timeStart)}
            </TextLikeInput>
          </div>
          <div>
            <Editor.Label>{getLocalizedString('rundown.editor.last_event_end')}</Editor.Label>
            <TextLikeInput className={style.textLikeInput} disabled>
              {formatTime(group.timeEnd)}
            </TextLikeInput>
          </div>
          <div>
            <Editor.Label htmlFor='duration'>{getLocalizedString('rundown.editor.scheduled_duration')}</Editor.Label>
            <TextLikeInput className={style.textLikeInput} disabled>
              {millisToString(group.duration, { fallback: enDash })}
            </TextLikeInput>
          </div>
        </div>
        <div className={style.inline}>
          <div>
            <Editor.Label htmlFor='eventId'>{getLocalizedString('rundown.editor.plan_offset')}</Editor.Label>
            <TextLikeInput
              offset={planOffsetLabel}
              className={cx([style.textLikeInput, planOffset === null && style.inactive])}
              disabled
            >
              {planOffset !== null && planOffset > 0 ? '+' : ''}
              {millisToString(planOffset, { fallback: enDash })}
            </TextLikeInput>
          </div>
          <TargetDurationInput
            duration={group.duration}
            targetDuration={group.targetDuration}
            submitHandler={handleSubmit}
          />
        </div>
      </div>

      <div className={style.column}>
        <Editor.Title>{getLocalizedString('rundown.editor.group_data')}</Editor.Title>
        <div>
          <Editor.Label>{getLocalizedString('rundown.editor.colour')}</Editor.Label>
          <SwatchSelect name='colour' value={group.colour} handleChange={handleSubmit} />
        </div>
        <EntryEditorTextInput
          field='title'
          label={getLocalizedString('common.title')}
          initialValue={group.title}
          submitHandler={handleSubmit}
        />
        <EventTextArea
          field='note'
          label={getLocalizedString('common.note')}
          initialValue={group.note}
          submitHandler={handleSubmit}
        />
      </div>

      <div className={style.column}>
        <Editor.Title>
          {getLocalizedString('rundown.editor.custom_fields')}
          {isEditor && (
            <AppLink search='settings=manage__custom'>
              {getLocalizedString('rundown.editor.manage_custom_fields')}
            </AppLink>
          )}
        </Editor.Title>
        <EntryEditorCustomFields fields={customFields} handleSubmit={handleSubmit} entry={group} />
      </div>
    </div>
  );
}
