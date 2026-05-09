import { PropsWithChildren, memo } from 'react';

import * as Editor from '../../../common/components/editor-utils/EditorUtils';
import { deviceAlt, deviceMod } from '../../../common/utils/deviceUtils';
import { useTranslation } from '../../../translation/useTranslation';

import style from './EventEditorEmpty.module.scss';

export default memo(EventEditorEmpty);

function EventEditorEmpty() {
  const { getLocalizedString } = useTranslation();

  return (
    <div className={style.entryEditor} data-testid='editor-container'>
      <div className={style.shortcutSection}>
        <Editor.Title className={style.prompt}>{getLocalizedString('rundown.editor.shortcuts_title')}</Editor.Title>
        <table className={style.shortcuts}>
          <tbody>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.find')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>F</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.open_settings')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>,</Kbd>
              </td>
            </tr>
            <tr className={style.spacer} />
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.select_entry')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>↑</Kbd>
                <AuxKey>/</AuxKey>
                <Kbd>↓</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.select_group')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>↑</Kbd>
                <AuxKey>/</AuxKey>
                <Kbd>↓</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.jump_to_top_bottom')}</td>
              <td>
                <Kbd>Home</Kbd>
                <AuxKey>/</AuxKey>
                <Kbd>End</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.page_up_down')}</td>
              <td>
                <Kbd>PgUp</Kbd>
                <AuxKey>/</AuxKey>
                <Kbd>PgDn</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.deselect_entry')}</td>
              <td>
                <Kbd>Esc</Kbd>
              </td>
            </tr>
            <tr className={style.spacer} />
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.reorder_selected')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>↑</Kbd>
                <AuxKey>/</AuxKey>
                <Kbd>↓</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.copy_selected')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>C</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.cut_selected')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>X</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.paste_above')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>V</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.paste_below')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>V</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.clone_selected')}</td>
              <td>
                <Kbd>{deviceMod}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>D</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.delete_selected')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Backspace</Kbd>
              </td>
            </tr>
            <tr className={style.spacer} />
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_event_below')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>E</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_event_above')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>E</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_group_below')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>G</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_group_above')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>G</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_milestone_below')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>M</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_milestone_above')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>M</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_delay_below')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>D</Kbd>
              </td>
            </tr>
            <tr>
              <td>{getLocalizedString('rundown.editor.shortcuts.add_delay_above')}</td>
              <td>
                <Kbd>{deviceAlt}</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>Shift</Kbd>
                <AuxKey>+</AuxKey>
                <Kbd>D</Kbd>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuxKey({ children }: PropsWithChildren) {
  return <span className={style.divider}>{children}</span>;
}

function Kbd({ children }: PropsWithChildren) {
  return <span className={style.kbd}>{children}</span>;
}
