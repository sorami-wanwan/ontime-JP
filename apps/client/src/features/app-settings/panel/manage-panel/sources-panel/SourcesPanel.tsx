import type {
  SpreadsheetPreviewResponse,
  SpreadsheetWorksheetMetadata,
  SpreadsheetWorksheetOptions,
} from 'ontime-types';
import { getErrorMessage, ImportMap } from 'ontime-utils';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { IoCloudOutline, IoDownloadOutline } from 'react-icons/io5';

import {
  getWorksheetMetadata as getExcelWorksheetMetadata,
  importRundownPreview as importExcelPreview,
  upload as uploadExcel,
} from '../../../../../common/api/excel';
import {
  getWorksheetMetadata as getGoogleWorksheetMetadata,
  previewRundown as previewGoogleSheet,
  uploadRundown,
} from '../../../../../common/api/sheets';
import Button from '../../../../../common/components/buttons/Button';
import Info from '../../../../../common/components/info/Info';
import ExternalLink from '../../../../../common/components/link/external-link/ExternalLink';
import Modal from '../../../../../common/components/modal/Modal';
import useRundown from '../../../../../common/hooks-query/useRundown';
import { validateExcelImport } from '../../../../../common/utils/uploadUtils';
import { useTranslation } from '../../../../../translation/useTranslation';
import * as Panel from '../../../panel-utils/PanelUtils';
import GSheetSetup from './GSheetSetup';
import SheetImportEditor from './sheet-import/SheetImportEditor';
import useSpreadsheetImport from './useSpreadsheetImport';

import style from './SourcesPanel.module.scss';

const googleSheetDocsUrl = 'https://docs.getontime.no/features/import-spreadsheet-gsheet/';

type ActiveSource =
  | {
      kind: 'excel';
      worksheetNames: string[];
      initialWorksheetMetadata: SpreadsheetWorksheetMetadata | null;
      closedByUser: boolean;
    }
  | {
      kind: 'gsheet';
      sheetId: string;
      worksheetNames: string[];
      initialWorksheetMetadata: SpreadsheetWorksheetMetadata | null;
      title: string;
      closedByUser: boolean;
    };

export default function SourcesPanel() {
  const [importFlow, setImportFlow] = useState<'none' | 'excel' | 'gsheet' | 'finished'>('none');
  const [error, setError] = useState('');
  const [hasFile, setHasFile] = useState<'none' | 'loading' | 'done'>('none');
  const [activeSource, setActiveSource] = useState<ActiveSource | null>(null);

  const { data: currentRundown } = useRundown();
  const { importRundown } = useSpreadsheetImport();
  const { getLocalizedString } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileToUpload = event.target.files?.[0];

    if (!fileToUpload) {
      setActiveSource(null);
      setHasFile('none');
      return;
    }
    try {
      setHasFile('loading');
      setError('');
      validateExcelImport(fileToUpload);
      const worksheetOptions = await uploadExcel(fileToUpload);
      setActiveSource({
        kind: 'excel',
        worksheetNames: worksheetOptions.worksheets,
        initialWorksheetMetadata: worksheetOptions.metadata,
        closedByUser: false,
      });
      setImportFlow('excel');
      setHasFile('done');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(`Error uploading file: ${errorMessage}`);
      setActiveSource(null);
      setHasFile('none');
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const resetFlow = () => {
    setImportFlow('none');
    setHasFile('none');
    setActiveSource(null);
    setError('');
  };

  const openGSheetFlow = () => {
    setError('');
    setActiveSource(null);
    setImportFlow('gsheet');
  };

  const cancelGSheetFlow = () => {
    resetFlow();
  };

  const cancelImportFlow = () => {
    if (activeSource && activeSource.kind === 'gsheet') {
      // Return to GSheetSetup so the user can change the sheet ID or revoke auth
      setActiveSource({ ...activeSource, closedByUser: true });
      setError('');
    } else {
      resetFlow();
    }
  };

  const handleFinished = () => {
    setImportFlow('finished');
    setHasFile('none');
    setActiveSource(null);
    setError('');
  };

  const handleApplyImport = async (preview: SpreadsheetPreviewResponse) => {
    if (!currentRundown) {
      throw new Error('No current rundown loaded');
    }

    await importRundown(
      {
        [currentRundown.id]: {
          ...preview.rundown,
          id: currentRundown.id,
          title: currentRundown.title,
        },
      },
      preview.customFields,
    );
    handleFinished();
  };

  const loadWorksheetMetadata = useCallback(
    (worksheet: string) => {
      if (!activeSource) {
        throw new Error('No spreadsheet source loaded');
      }

      return activeSource.kind === 'excel'
        ? getExcelWorksheetMetadata(worksheet)
        : getGoogleWorksheetMetadata(activeSource.sheetId, worksheet);
    },
    [activeSource],
  );

  const previewImport = useCallback(
    (importMap: ImportMap): Promise<SpreadsheetPreviewResponse> => {
      if (!activeSource) {
        throw new Error('No spreadsheet source loaded');
      }

      return activeSource.kind === 'excel'
        ? importExcelPreview(importMap)
        : previewGoogleSheet(activeSource.sheetId, importMap);
    },
    [activeSource],
  );

  const exportToGoogleSheet = useCallback(
    (importMap: ImportMap): Promise<void> => {
      if (!activeSource || activeSource.kind !== 'gsheet') {
        throw new Error('Google Sheet source not available');
      }

      return uploadRundown(activeSource.sheetId, importMap);
    },
    [activeSource],
  );

  const handleSheetLoaded = useCallback((sheetId: string, worksheetOptions: SpreadsheetWorksheetOptions) => {
    setActiveSource({
      kind: 'gsheet',
      sheetId,
      worksheetNames: worksheetOptions.worksheets,
      initialWorksheetMetadata: worksheetOptions.metadata,
      title: worksheetOptions.title ?? '',
      closedByUser: false,
    });
  }, []);

  const closedByUser = activeSource?.closedByUser ?? false;
  const isGSheetFlow = importFlow === 'gsheet';
  const showInput = importFlow === 'none';
  const showCompleted = importFlow === 'finished';

  const showImportWorkspace = activeSource !== null && !closedByUser;
  const importModalTitle = (() => {
    if (!activeSource) return '';
    if (activeSource.kind === 'excel') return getLocalizedString('settings.manage.sources_panel.import_spreadsheet');
    return activeSource.title
      ? `${getLocalizedString('settings.manage.sources_panel.sync')}${activeSource.title}`
      : getLocalizedString('settings.manage.sources_panel.sync_google_sheet');
  })();
  const sourceKey = (() => {
    if (!activeSource) return null;
    if (activeSource.kind === 'excel') return 'excel';
    return `gsheet:${activeSource.sheetId}`;
  })();

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>{getLocalizedString('settings.manage.sources_panel.title')}</Panel.SubHeader>
        {error && <Panel.Error>{error}</Panel.Error>}
        {showInput && (
          <div className={style.introStack}>
            <Info>
              <Info.Title>{getLocalizedString('settings.manage.sources_panel.intro_title')}</Info.Title>
              <Info.Body>{getLocalizedString('settings.manage.sources_panel.intro_body')}</Info.Body>
              <Info.Footer>
                <ExternalLink href={googleSheetDocsUrl}>
                  {getLocalizedString('settings.manage.sources_panel.read_guide')}
                </ExternalLink>
              </Info.Footer>
            </Info>
            <input
              ref={fileInputRef}
              style={{ display: 'none' }}
              type='file'
              onChange={handleFile}
              accept='.xlsx'
              data-testid='file-input'
            />
            <div className={style.sourceGrid}>
              <section className={style.sourceCard}>
                <div className={style.sourceHeader}>
                  <h4 className={style.sourceTitle}>
                    {getLocalizedString('settings.manage.sources_panel.import_spreadsheet')}
                  </h4>
                </div>
                <p className={style.sourceDescription}>
                  {getLocalizedString('settings.manage.sources_panel.import_spreadsheet_desc')}
                </p>
                <div className={style.sourceMeta}>
                  {getLocalizedString('settings.manage.sources_panel.import_spreadsheet_meta')}
                </div>
                <Button variant='primary' size='large' fluid onClick={handleUpload} loading={hasFile === 'loading'}>
                  <IoDownloadOutline />
                  {getLocalizedString('settings.manage.sources_panel.import_spreadsheet_btn')}
                </Button>
              </section>
              <section className={style.sourceCard}>
                <div className={style.sourceHeader}>
                  <h4 className={style.sourceTitle}>
                    {getLocalizedString('settings.manage.sources_panel.sync_google')}
                  </h4>
                </div>
                <p className={style.sourceDescription}>
                  {getLocalizedString('settings.manage.sources_panel.sync_google_desc')}
                </p>
                <div className={style.sourceMeta}>
                  {getLocalizedString('settings.manage.sources_panel.sync_google_meta')}
                </div>
                <Button variant='primary' size='large' fluid onClick={openGSheetFlow} disabled={hasFile !== 'none'}>
                  <IoCloudOutline />
                  {getLocalizedString('settings.manage.sources_panel.sync_google_btn')}
                </Button>
              </section>
            </div>
          </div>
        )}
        {showCompleted && (
          <div className={style.finishSection}>
            <span className={style.finishBadge}>
              {getLocalizedString('settings.manage.sources_panel.import_complete')}
            </span>
            <div className={style.finishTitle}>
              {getLocalizedString('settings.manage.sources_panel.import_applied')}
            </div>
            <div className={style.finishDescription}>
              {getLocalizedString('settings.manage.sources_panel.import_close_info')}
            </div>
            <Button variant='subtle-white' onClick={resetFlow}>
              {getLocalizedString('settings.manage.sources_panel.reset_flow')}
            </Button>
          </div>
        )}
        {isGSheetFlow && (
          <GSheetSetup onCancel={cancelGSheetFlow} onSheetLoaded={handleSheetLoaded} closedByUser={closedByUser} />
        )}
        <Modal
          isOpen={showImportWorkspace}
          title={importModalTitle}
          showBackdrop
          showCloseButton
          size='wide'
          onClose={cancelImportFlow}
          bodyElements={
            <SheetImportEditor
              sourceKey={sourceKey ?? 'spreadsheet'}
              worksheetNames={activeSource?.worksheetNames ?? []}
              initialMetadata={activeSource?.initialWorksheetMetadata ?? null}
              loadMetadata={loadWorksheetMetadata}
              previewImport={previewImport}
              onApply={handleApplyImport}
              onCancel={cancelImportFlow}
              onExport={activeSource?.kind === 'gsheet' ? exportToGoogleSheet : undefined}
            />
          }
        />
      </Panel.Card>
    </Panel.Section>
  );
}
