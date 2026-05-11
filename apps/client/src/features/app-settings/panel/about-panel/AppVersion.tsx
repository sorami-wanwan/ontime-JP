import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import useAppVersion from '../../../../common/hooks-query/useAppVersion';
import { appVersion, isOntimeCloud } from '../../../../externals';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';

export default function AppVersion() {
  const { getLocalizedString } = useTranslation();
  const { data, isError } = useAppVersion();

  if (isError) {
    return (
      <Panel.Paragraph>
        {getLocalizedString('settings.about.version_current').replace('{{version}}', appVersion)}
        <Panel.Error>{getLocalizedString('settings.about.version_error')}</Panel.Error>
      </Panel.Paragraph>
    );
  }

  if (data.hasUpdates) {
    return (
      <Panel.Paragraph>
        {getLocalizedString('settings.about.version_current').replace('{{version}}', appVersion)}
        <br />
        <br />
        {getLocalizedString('settings.about.version_update_available').replace('{{version}}', data.version)} <br />
        {isOntimeCloud ? (
          getLocalizedString('settings.about.version_cloud_restart')
        ) : (
          <ExternalLink href={data.url}>{getLocalizedString('settings.about.version_download')}</ExternalLink>
        )}
      </Panel.Paragraph>
    );
  }

  return (
    <Panel.Paragraph>
      {getLocalizedString('settings.about.version_latest').replace('{{version}}', appVersion)}
    </Panel.Paragraph>
  );
}
