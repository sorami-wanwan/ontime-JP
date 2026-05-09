import useScrollIntoView from '../../../../common/hooks/useScrollIntoView';
import { isDocker } from '../../../../externals';
import type { PanelBaseProps } from '../../panel-list/PanelList';
import * as Panel from '../../panel-utils/PanelUtils';
import { useTranslation } from '../../../../translation/TranslationProvider';
import CustomViews from '../manage-panel/CustomViews';
import GeneralSettings from './GeneralSettings';
import ProjectData from './ProjectData';
import ServerPortSettings from './ServerPortSettings';
import ViewSettings from './ViewSettings';

export default function SettingsPanel({ location }: PanelBaseProps) {
  const { getLocalizedString } = useTranslation();
  const dataRef = useScrollIntoView<HTMLDivElement>('data', location);
  const generalRef = useScrollIntoView<HTMLDivElement>('general', location);
  const viewRef = useScrollIntoView<HTMLDivElement>('view', location);
  const customViewsRef = useScrollIntoView<HTMLDivElement>('custom-views', location);
  const portRef = useScrollIntoView<HTMLDivElement>('port', location);

  return (
    <>
      <Panel.Header>{getLocalizedString('settings.title')}</Panel.Header>
      <div ref={dataRef}>
        <ProjectData />
      </div>
      <div ref={generalRef}>
        <GeneralSettings />
      </div>
      <div ref={viewRef}>
        <ViewSettings />
      </div>
      <div ref={customViewsRef}>
        <CustomViews />
      </div>
      {!isDocker && (
        <div ref={portRef}>
          <ServerPortSettings />
        </div>
      )}
    </>
  );
}