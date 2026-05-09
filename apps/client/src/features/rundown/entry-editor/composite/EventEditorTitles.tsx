import { memo } from 'react';

import * as Editor from '../../../../common/components/editor-utils/EditorUtils';
import SwatchSelect from '../../../../common/components/input/colour-input/SwatchSelect';
import Input from '../../../../common/components/input/input/Input';
import Switch from '../../../../common/components/switch/Switch';
import { useEntryActionsContext } from '../../../../common/context/EntryActionsContext';
import { useTranslation } from '../../../../translation/useTranslation';
import EventTextArea from './EventTextArea';
import EntryEditorTextInput from './EventTextInput';

import style from '../EntryEditor.module.scss';

interface EventEditorTitlesProps {
  eventId: string;
  cue: string;
  flag: boolean;
  title: string;
  note: string;
  colour: string;
}

export default memo(EventEditorTitles);
function EventEditorTitles({ eventId, cue, flag, title, note, colour }: EventEditorTitlesProps) {
  const { updateEntry } = useEntryActionsContext();
  const { getLocalizedString } = useTranslation();

  const flagSubmitHandler = (newValue: boolean) => {
    updateEntry({ id: eventId, flag: newValue });
  };

  const textSubmitHandler = (field: string, newValue: string) => {
    updateEntry({ id: eventId, [field]: newValue });
  };

  return (
    <div className={style.column}>
      <Editor.Title>{getLocalizedString('rundown.editor.event_data')}</Editor.Title>
      <div className={style.splitThree}>
        <div>
          <Editor.Label htmlFor='eventId'>{getLocalizedString('rundown.editor.event_id')}</Editor.Label>
          <Input id='eventId' data-testid='input-textfield' value={eventId} readOnly fluid />
        </div>
        <EntryEditorTextInput
          field='cue'
          label={getLocalizedString('common.cue')}
          initialValue={cue}
          submitHandler={textSubmitHandler}
          maxLength={10}
        />
        <div>
          <Editor.Label htmlFor='flag'>{getLocalizedString('rundown.editor.flag')}</Editor.Label>
          <Editor.Label className={style.switchLabel}>
            <Switch id='flag' checked={flag} onCheckedChange={flagSubmitHandler} />
            {flag ? getLocalizedString('common.on') : getLocalizedString('common.off')}
          </Editor.Label>
        </div>
      </div>
      <div>
        <Editor.Label>{getLocalizedString('rundown.editor.colour')}</Editor.Label>
        <SwatchSelect name='colour' value={colour} handleChange={textSubmitHandler} />
      </div>
      <EntryEditorTextInput
        field='title'
        label={getLocalizedString('common.title')}
        initialValue={title}
        submitHandler={textSubmitHandler}
      />
      <EventTextArea
        field='note'
        label={getLocalizedString('common.note')}
        initialValue={note}
        submitHandler={textSubmitHandler}
      />
    </div>
  );
}
