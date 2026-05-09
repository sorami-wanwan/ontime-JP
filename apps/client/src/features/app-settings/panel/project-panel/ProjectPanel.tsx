import useScrollIntoView from '../../../../common/hooks/useScrollIntoView';
import { useTranslation } from '../../../../translation/useTranslation';
import type { PanelBaseProps } from '../../panel-list/PanelList';
import * as Panel from '../../panel-utils/PanelUtils';
import QuickStart from '../../quick-start/QuickStart';
import type { SettingsOptionId } from '../../useAppSettingsMenu';
import ManageProjects from './ManageProjects';

interface ProjectPanelProps extends PanelBaseProps {
  setLocation: (location: SettingsOptionId) => void;
}

export default function ProjectPanel({ location, setLocation }: ProjectPanelProps) {
  const { getLocalizedString } = useTranslation();
  const manageProjectsRef = useScrollIntoView<HTMLDivElement>('list', location);

  const handleQuickClose = () => {
    setLocation('project');
  };

  return (
    <>
      <Panel.Header>{getLocalizedString('settings.project.panel_title')}</Panel.Header>
      <QuickStart isOpen={location === 'create'} onClose={handleQuickClose} />
      <div ref={manageProjectsRef}>
        <ManageProjects />
      </div>
    </>
  );
}
