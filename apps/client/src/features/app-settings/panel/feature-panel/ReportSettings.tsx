import { useMemo } from 'react';
import { IoTrashBin } from 'react-icons/io5';

import { deleteAllReport } from '../../../../common/api/report';
import { createBlob, downloadBlob } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import useReport from '../../../../common/hooks-query/useReport';
import useRundown from '../../../../common/hooks-query/useRundown';
import { cx } from '../../../../common/utils/styleUtils';
import { formatTime } from '../../../../common/utils/time';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import { CombinedReport, getCombinedReport, makeReportCSV } from './reportSettings.utils';

import style from './ReportSettings.module.scss';

export default function ReportSettings() {
  const { getLocalizedString } = useTranslation();
  const { data: reportData } = useReport();
  const { data } = useRundown();

  const clearReport = async () => await deleteAllReport();
  const downloadCSV = (combinedReport: CombinedReport[]) => {
    if (!combinedReport) {
      return;
    }
    const csv = makeReportCSV(combinedReport);
    const blob = createBlob(csv, 'text/csv;charset=utf-8;');
    downloadBlob(blob, 'ontime-report.csv');
  };

  const combinedReport = useMemo(() => {
    return getCombinedReport(reportData, data.entries, data.flatOrder);
  }, [reportData, data.entries, data.flatOrder]);

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>{getLocalizedString('settings.features.report.title')}</Panel.SubHeader>
        <Panel.Divider />
        <Panel.Section>
          <Panel.Title>
            {getLocalizedString('settings.features.report.manage')}
            <Panel.InlineElements>
              <Button onClick={() => downloadCSV(combinedReport)} disabled={combinedReport.length === 0}>
                <IoTrashBin />
                {getLocalizedString('settings.features.report.export_csv')}
              </Button>
              <Button variant='subtle-destructive' onClick={clearReport} disabled={combinedReport.length === 0}>
                <IoTrashBin />
                {getLocalizedString('settings.features.report.clear_all')}
              </Button>
            </Panel.InlineElements>
          </Panel.Title>
        </Panel.Section>
        <Panel.Section>
          <Panel.Table>
            <thead>
              <tr>
                <th>#</th>
                <th>{getLocalizedString('settings.features.report.cue')}</th>
                <th>{getLocalizedString('settings.features.report.table_title')}</th>
                <th>{getLocalizedString('settings.features.report.scheduled_start')}</th>
                <th>{getLocalizedString('settings.features.report.actual_start')}</th>
                <th>{getLocalizedString('settings.features.report.scheduled_end')}</th>
                <th>{getLocalizedString('settings.features.report.actual_end')}</th>
              </tr>
            </thead>
            <tbody>
              {combinedReport.length === 0 && (
                <Panel.TableEmpty label={getLocalizedString('settings.features.report.empty_label')} />
              )}

              {combinedReport.map((entry) => {
                const start = (() => {
                  if (entry.actualStart === null) return null;
                  if (entry.actualStart <= entry.scheduledStart) return 'under';
                  return 'over';
                })();
                const end = (() => {
                  if (entry.actualEnd === null) return null;
                  if (entry.actualEnd <= entry.scheduledEnd) return 'under';
                  return 'over';
                })();
                return (
                  <tr key={entry.id}>
                    <th>{entry.index}</th>
                    <th>{entry.cue}</th>
                    <th>{entry.title}</th>
                    <th className={cx([start && style[start]])}>{formatTime(entry.scheduledStart)}</th>
                    <th className={cx([start && style[start]])}>{formatTime(entry.actualStart)}</th>
                    <th className={cx([end && style[end]])}>{formatTime(entry.scheduledEnd)}</th>
                    <th className={cx([end && style[end]])}>{formatTime(entry.actualEnd)}</th>
                  </tr>
                );
              })}
            </tbody>
          </Panel.Table>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
