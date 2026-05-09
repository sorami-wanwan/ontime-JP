import { OntimeMilestone } from 'ontime-types';
import { useCallback } from 'react';

import * as Editor from '../../../common/components/editor-utils/EditorUtils';
import SwatchSelect from '../../../common/components/input/colour-input/SwatchSelect';
import Input from '../../../common/components/input/input/Input';
import AppLink from '../../../common/components/link/app-link/AppLink';
import { useEntryActionsContext } from '../../../common/context/EntryActionsContext';
import useCustomFields from '../../../common/hooks-query/useCustomFields';
import { useTranslation } from '../../../translation/useTranslation';
import EntryEditorCustomFields from './composite/EventEditorCustomFields';
import EventTextArea from './composite/EventTextArea';
import EntryEditorTextInput from './composite/EventTextInput';

import style from './EntryEditor.module.scss';

// cue + title + colour + custom field labels
export type MilestoneEditorUpdateTextFields = 'cue' | 'title' | 'colour' | string;

interface MilestoneEditorProps {
  milestone: OntimeMilestone;
}
export default function MilestoneEditor({ milestone }: MilestoneEditorProps) {
  const { data: customFields } = useCustomFields();
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  const handleSubmit = useCallback(
    (field: MilestoneEditorUpdateTextFields, value: string) => {
      // Handle custom fields
      if (typeof field === 'string' && field.startsWith('custom-')) {
        const fieldLabel = field.split('custom-')[1];
        updateEntry({ id: milestone.id, custom: { [fieldLabel]: value } });
        return;
      }
      // all other strings are text fields
      return updateEntry({ id: milestone.id, [field]: value });
    },
    [milestone.id, updateEntry],
  );

  const isEditor = window.location.pathname.includes('editor');

  return (
    <div className={style.content}>
      <div className={style.column}>
        <Editor.Title>{getLocalizedString('rundown.editor.milestone_data')}</Editor.Title>
        <div className={style.splitTwo}>
          <div>
            <Editor.Label htmlFor='entryId'>{getLocalizedString('rundown.editor.milestone_id')}</Editor.Label>
            <Input id='entryId' data-testid='input-textfield' value={milestone.id} readOnly fluid />
          </div>
          <EntryEditorTextInput
            field='cue'
            label={getLocalizedString('common.cue')}
            initialValue={milestone.cue}
            submitHandler={handleSubmit}
            maxLength={10}
          />
        </div>
        <div>
          <Editor.Label>{getLocalizedString('rundown.editor.colour')}</Editor.Label>
          <SwatchSelect name='colour' value={milestone.colour} handleChange={handleSubmit} />
        </div>
        <EntryEditorTextInput
          field='title'
          label={getLocalizedString('common.title')}
          initialValue={milestone.title}
          submitHandler={handleSubmit}
        />
        <EventTextArea
          field='note'
          label={getLocalizedString('common.note')}
          initialValue={milestone.note}
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
        <EntryEditorCustomFields fields={customFields} handleSubmit={handleSubmit} entry={milestone} />
      </div>
    </div>
  );
}
