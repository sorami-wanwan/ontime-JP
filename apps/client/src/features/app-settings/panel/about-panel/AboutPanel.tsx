import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import {
  buyMeACoffeeUrl,
  discordUrl,
  documentationUrl,
  githubSponsorUrl,
  githubUrl,
  subredditUrl,
  websiteUrl,
  youtubeUrl,
} from '../../../../externals';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import AppVersion from './AppVersion';

export default function AboutPanel() {
  const { getLocalizedString } = useTranslation();
  return (
    <>
      <Panel.Header>{getLocalizedString('settings.about.title')}</Panel.Header>
      <Panel.Section>
        <Panel.Card>
          <Panel.SubHeader>{getLocalizedString('settings.about.ontime_subheader')}</Panel.SubHeader>
          <Panel.Paragraph>
            {getLocalizedString('settings.about.description')}
            <ExternalLink href={websiteUrl}>www.getontime.no</ExternalLink>
          </Panel.Paragraph>
          <Panel.Paragraph>
            {getLocalizedString('settings.about.sponsor')}
            <ExternalLink href={githubSponsorUrl}>{getLocalizedString('settings.about.github_sponsors')}</ExternalLink>
            <ExternalLink href={buyMeACoffeeUrl}>{getLocalizedString('settings.about.buy_me_coffee')}</ExternalLink>
          </Panel.Paragraph>
          <Panel.Paragraph>
            {getLocalizedString('settings.about.cloud_description')}
            <ExternalLink href={websiteUrl}>www.getontime.no</ExternalLink>
          </Panel.Paragraph>
        </Panel.Card>
        <Panel.SubHeader>{getLocalizedString('settings.about.current_version')}</Panel.SubHeader>
        <AppVersion />
        <Panel.SubHeader>{getLocalizedString('settings.about.links')}</Panel.SubHeader>
        <ExternalLink href={documentationUrl}>{getLocalizedString('settings.about.read_docs')}</ExternalLink>
        <ExternalLink href={githubUrl}>{getLocalizedString('settings.about.follow_github')}</ExternalLink>
        <ExternalLink href={discordUrl}>{getLocalizedString('settings.about.discord')}</ExternalLink>
        <ExternalLink href={youtubeUrl}>{getLocalizedString('settings.about.youtube')}</ExternalLink>
        <ExternalLink href={subredditUrl}>{getLocalizedString('settings.about.subreddit')}</ExternalLink>
      </Panel.Section>
    </>
  );
}

