import useScrollIntoView from '../../../../common/hooks/useScrollIntoView';
import { isOntimeCloud } from '../../../../externals';
import { useTranslation } from '../../../../translation/useTranslation';
import GenerateLinkFormExport from '../../../sharing/GenerateLinkFormExport';
import type { PanelBaseProps } from '../../panel-list/PanelList';
import * as Panel from '../../panel-utils/PanelUtils';
import InfoNif from '../network-panel/NetworkInterfaces';
import ReportSettings from './ReportSettings';
import URLPresets from './URLPresets';

export default function FeaturePanel({ location }: PanelBaseProps) {
  const { getLocalizedString } = useTranslation();
  const presetsRef = useScrollIntoView<HTMLDivElement>('presets', location);
  const linkRef = useScrollIntoView<HTMLDivElement>('link', location);
  const reportRef = useScrollIntoView<HTMLDivElement>('report', location);

  return (
    <>
      <Panel.Header>{getLocalizedString('settings.features.panel_title')}</Panel.Header>
      <div ref={presetsRef}>
        <URLPresets />
      </div>
      <div ref={linkRef}>
        <Panel.Section>
          <Panel.Card>
            <Panel.SubHeader>{getLocalizedString('settings.features.share_link')}</Panel.SubHeader>
            {!isOntimeCloud && (
              <>
                <Panel.Paragraph>{getLocalizedString('settings.features.network_interfaces')}</Panel.Paragraph>
                <InfoNif />
              </>
            )}
            <Panel.Divider />
            <GenerateLinkFormExport />
          </Panel.Card>
        </Panel.Section>
      </div>
      <div ref={reportRef}>
        <ReportSettings />
      </div>
    </>
  );
}
