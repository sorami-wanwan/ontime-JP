import { SupportedEntry } from 'ontime-types';
import { IoAdd } from 'react-icons/io5';

import Button from '../../common/components/buttons/Button';
import * as Editor from '../../common/components/editor-utils/EditorUtils';
import Empty from '../../common/components/state/Empty';
import { useTranslation } from '../../translation/useTranslation';

import style from './Empty.module.scss';

interface RundownEmptyProps {
  handleAddNew: (type: SupportedEntry) => void;
}

export default function RundownEmpty(props: RundownEmptyProps) {
  const { handleAddNew } = props;
  const { getLocalizedString } = useTranslation();

  return (
    <div className={style.empty}>
      <Empty injectedStyles={{ marginTop: '5vh', marginBottom: '3rem' }} />
      <div className={style.inline}>
        <Button onClick={() => handleAddNew(SupportedEntry.Event)} variant='primary' size='large'>
          <IoAdd />
          {getLocalizedString('rundown.empty.create_event')}
        </Button>

        <Editor.Separator />

        <Button onClick={() => handleAddNew(SupportedEntry.Group)} variant='primary' size='large'>
          <IoAdd />
          {getLocalizedString('rundown.empty.create_group')}
        </Button>
      </div>
    </div>
  );
}
