import { AutomationDTO, NormalisedAutomation } from 'ontime-types';
import { Fragment, useState } from 'react';
import { IoAdd, IoPencil, IoTrash } from 'react-icons/io5';

import { deleteAutomation } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Info from '../../../../common/components/info/Info';
import Tag from '../../../../common/components/tag/Tag';
import useAutomationSettings from '../../../../common/hooks-query/useAutomationSettings';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import AutomationForm from './AutomationForm';

const automationPlaceholder: AutomationDTO = {
  title: '',
  filterRule: 'all',
  filters: [],
  outputs: [],
};

interface AutomationsListProps {
  automations: NormalisedAutomation;
  enabledAutomations?: boolean;
}

export default function AutomationsList(props: AutomationsListProps) {
  const { getLocalizedString } = useTranslation();
  const { automations, enabledAutomations } = props;
  const { refetch } = useAutomationSettings();
  const [automationFormData, setAutomationFormData] = useState<AutomationDTO | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeleteError(null);
      await deleteAutomation(id);
    } catch (error) {
      setDeleteError(maybeAxiosError(error));
    } finally {
      refetch();
    }
  };

  const arrayAutomations = Object.keys(automations);

  return (
    <Panel.Card>
      <Panel.SubHeader>
        {getLocalizedString('settings.automations.manage_automations.title')}
        <Button
          type='submit'
          disabled={Boolean(automationFormData)}
          onClick={() => setAutomationFormData(automationPlaceholder)}
        >
          {getLocalizedString('settings.automations.manage_automations.new')} <IoAdd />
        </Button>
      </Panel.SubHeader>

      <Panel.Divider />

      {enabledAutomations === false && (
        <Info>{getLocalizedString('settings.automations.manage_automations.disabled_info')}</Info>
      )}

      {automationFormData !== null && (
        <AutomationForm automation={automationFormData} onClose={() => setAutomationFormData(null)} />
      )}

      <Panel.Table>
        <thead>
          <tr>
            <th style={{ width: '45%' }}>
              {getLocalizedString('settings.automations.manage_automations.table_title')}
            </th>
            <th style={{ width: '15%' }}>
              {getLocalizedString('settings.automations.manage_automations.trigger_rule')}
            </th>
            <th style={{ width: '15%' }}>{getLocalizedString('settings.automations.manage_automations.filters')}</th>
            <th style={{ width: '15%' }}>{getLocalizedString('settings.automations.manage_automations.outputs')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {arrayAutomations.length === 0 && (
            <Panel.TableEmpty
              handleClick={!automationFormData ? () => setAutomationFormData(automationPlaceholder) : undefined}
            />
          )}
          {arrayAutomations.map((automationId) => {
            if (!Object.hasOwn(automations, automationId)) {
              return null;
            }
            return (
              <Fragment key={automationId}>
                <tr>
                  <td>{automations[automationId].title}</td>
                  <td>
                    <Tag>{automations[automationId].filterRule}</Tag>
                  </td>
                  <td>{automations[automationId].filters.length}</td>
                  <td>{automations[automationId].outputs.length}</td>
                  <Panel.InlineElements align='end' relation='inner' as='td'>
                    <IconButton
                      variant='ghosted-white'
                      aria-label='Edit entry'
                      onClick={() => setAutomationFormData(automations[automationId])}
                    >
                      <IoPencil />
                    </IconButton>
                    <IconButton
                      variant='ghosted-destructive'
                      aria-label='Delete entry'
                      onClick={() => handleDelete(automationId)}
                    >
                      <IoTrash />
                    </IconButton>
                  </Panel.InlineElements>
                </tr>
              </Fragment>
            );
          })}
          {deleteError && (
            <tr>
              <td colSpan={5}>
                <Panel.Error>{deleteError}</Panel.Error>
              </td>
            </tr>
          )}
        </tbody>
      </Panel.Table>
    </Panel.Card>
  );
}
