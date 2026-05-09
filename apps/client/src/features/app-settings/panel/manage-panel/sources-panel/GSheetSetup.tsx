import type { AuthenticationStatus, SpreadsheetWorksheetOptions } from 'ontime-types';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { IoCheckmark, IoCloudDownloadOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

import {
  getWorksheetOptions,
  requestConnection,
  revokeAuthentication,
  verifyAuthenticationStatus,
} from '../../../../../common/api/sheets';
import { maybeAxiosError } from '../../../../../common/api/utils';
import Button from '../../../../../common/components/buttons/Button';
import CopyTag from '../../../../../common/components/copy-tag/CopyTag';
import Input from '../../../../../common/components/input/input/Input';
import Tag from '../../../../../common/components/tag/Tag';
import { openLink } from '../../../../../common/utils/linkUtils';
import { useTranslation } from '../../../../../translation/useTranslation';
import * as Panel from '../../../panel-utils/PanelUtils';
import { extractSheetId, getPersistedSheetId, persistSheetId } from './gsheetUtils';

import style from './SourcesPanel.module.scss';

interface GSheetSetupProps {
  onCancel: () => void;
  onSheetLoaded: (sheetId: string, options: SpreadsheetWorksheetOptions) => void;
  closedByUser: boolean;
}

export default function GSheetSetup(props: GSheetSetupProps) {
  const { onCancel, onSheetLoaded, closedByUser } = props;

  const [file, setFile] = useState<File | null>(null);
  const [sheetId, setSheetId] = useState(getPersistedSheetId);
  const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatus>('not_authenticated');
  const { getLocalizedString } = useTranslation();
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [authLink, setAuthLink] = useState('');
  const [loading, setLoading] = useState<'' | 'cancel' | 'connect' | 'authenticate' | 'load-sheet'>('');
  const [authError, setAuthError] = useState('');
  const [worksheetError, setWorksheetError] = useState('');
  const pollTimeoutRef = useRef<number | null>(null);
  const authFallbackTimeoutRef = useRef<number | null>(null);
  const focusListenerRef = useRef<(() => void) | null>(null);

  const clearPollTimeout = useCallback(() => {
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const clearAuthFallbackTimeout = useCallback(() => {
    if (authFallbackTimeoutRef.current !== null) {
      window.clearTimeout(authFallbackTimeoutRef.current);
      authFallbackTimeoutRef.current = null;
    }
  }, []);

  const clearFocusListener = useCallback(() => {
    if (focusListenerRef.current !== null) {
      window.removeEventListener('focus', focusListenerRef.current);
      focusListenerRef.current = null;
    }
  }, []);

  const loadWorksheetOptions = useCallback(
    async (nextSheetId: string) => {
      const worksheetOptions = await getWorksheetOptions(nextSheetId);
      persistSheetId(nextSheetId);
      onSheetLoaded(nextSheetId, worksheetOptions);
      setWorksheetError('');
    },
    [onSheetLoaded],
  );

  const pollUntilAuthenticated = useCallback(
    async (attempts: number = 0) => {
      clearPollTimeout();
      if (closedByUser) return;

      try {
        const result = await verifyAuthenticationStatus();
        setAuthenticationStatus(result.authenticated);
        setSheetId(result.sheetId);

        if (result.authenticated === 'pending') {
          if (attempts < 10) {
            pollTimeoutRef.current = window.setTimeout(() => {
              pollUntilAuthenticated(attempts + 1);
            }, 2000);
            return; // Keep authKey for next poll
          }
          // Polling timed out
          setAuthKey(null);
          setLoading('');
          return;
        }

        if (result.authenticated === 'authenticated' && result.sheetId) {
          setLoading('load-sheet');
          try {
            await loadWorksheetOptions(result.sheetId);
          } catch (error) {
            setWorksheetError(maybeAxiosError(error));
          }
        }

        setAuthKey(null);
        setLoading('');
      } catch (error) {
        setAuthError(maybeAxiosError(error));
        setAuthKey(null);
        setLoading('');
      }
    },
    [clearPollTimeout, loadWorksheetOptions, closedByUser],
  );

  /** check if the current session has been authenticated */
  useEffect(() => {
    setAuthError('');
    pollUntilAuthenticated();

    return () => {
      clearFocusListener();
      clearPollTimeout();
      clearAuthFallbackTimeout();
    };
  }, [clearAuthFallbackTimeout, clearFocusListener, clearPollTimeout, pollUntilAuthenticated]);

  // user cancels the flow
  const handleRevoke = async () => {
    setLoading('cancel');
    try {
      const result = await revokeAuthentication();
      setAuthenticationStatus(result.authenticated);
      setSheetId('');
      setAuthKey(null);
      setAuthLink('');
      setAuthError('');
      setWorksheetError('');
    } catch (error) {
      setAuthError(maybeAxiosError(error));
    } finally {
      setLoading('');
    }
  };

  const handleCancelFlow = () => {
    onCancel();
  };

  /**
   * Gets file from input
   */
  const handleClientSecret = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }
    setFile(event.target.files[0]);
  };

  /**
   * Requests a device code from Google. The user can copy it before opening the browser.
   */
  const handleConnect = async () => {
    if (!file) return;
    if (!sheetId) return;
    setLoading('connect');
    setAuthError('');
    setWorksheetError('');

    try {
      const result = await requestConnection(file, sheetId);
      setAuthLink(result.verification_url);
      setAuthKey(result.user_code);
    } catch (error) {
      setAuthError(maybeAxiosError(error));
    } finally {
      setLoading('');
    }
  };

  /**
   * Opens the Google verification page and starts polling for completion.
   */
  const handleAuthenticate = () => {
    setLoading('authenticate');
    setAuthError('');
    clearFocusListener();
    clearPollTimeout();
    clearAuthFallbackTimeout();

    openLink(authLink);
    authFallbackTimeoutRef.current = window.setTimeout(() => {
      if (document.hasFocus()) {
        setLoading('');
      }
    }, 1500);

    function authFocusHandler() {
      clearAuthFallbackTimeout();
      clearFocusListener();
      pollUntilAuthenticated();
    }

    focusListenerRef.current = authFocusHandler;
    window.addEventListener('focus', authFocusHandler, { once: true });
  };

  const handleLoadSheet = async () => {
    if (!sheetId) return;

    setLoading('load-sheet');
    setWorksheetError('');

    try {
      await loadWorksheetOptions(sheetId);
    } catch (error) {
      setWorksheetError(maybeAxiosError(error));
    } finally {
      setLoading('');
    }
  };

  const canConnect = Boolean(file) && Boolean(sheetId);
  const canLoadSheet = Boolean(sheetId);
  const canAuthenticate = Boolean(authKey) && Boolean(authLink);
  const isLoading = Boolean(loading);
  const isAuthenticated = authenticationStatus === 'authenticated';
  const isAuthenticating = authenticationStatus === 'pending';
  const statusLabel = isAuthenticated
    ? getLocalizedString('settings.manage.gsheet_setup.connected')
    : isAuthenticating
      ? getLocalizedString('settings.manage.gsheet_setup.waiting')
      : getLocalizedString('settings.manage.gsheet_setup.not_connected');
  const statusClass = isAuthenticated ? style.statusReady : isAuthenticating ? style.statusPending : style.statusIdle;
  const statusVariant = isAuthenticated ? 'default' : 'warning';
  const setupMessage = isAuthenticated
    ? getLocalizedString('settings.manage.gsheet_setup.setup_connected')
    : canAuthenticate
      ? getLocalizedString('settings.manage.gsheet_setup.setup_authenticate')
      : getLocalizedString('settings.manage.gsheet_setup.setup_idle');

  return (
    <Panel.Section className={style.setupShell}>
      <Panel.Title>
        {getLocalizedString('settings.manage.gsheet_setup.title')}
        {isAuthenticated ? (
          <Button onClick={handleRevoke} loading={loading === 'cancel'}>
            {getLocalizedString('settings.manage.gsheet_setup.revoke_auth')}
          </Button>
        ) : (
          <Button onClick={handleCancelFlow}>{getLocalizedString('settings.manage.gsheet_setup.go_back')}</Button>
        )}
      </Panel.Title>
      <div className={style.setupIntro}>
        <div className={style.setupIntroText}>
          <p className={style.setupLead}>{statusLabel}</p>
          <p className={style.setupBody}>{setupMessage}</p>
        </div>
        <Tag className={statusClass} variant={statusVariant}>
          {statusLabel}
        </Tag>
      </div>
      {!isAuthenticated && (
        <Panel.ListGroup className={style.setupBlock}>
          <Panel.Description>{getLocalizedString('settings.manage.gsheet_setup.upload_secret')}</Panel.Description>
          <Panel.Error>{authError}</Panel.Error>
          <Input
            fluid
            type='file'
            onChange={handleClientSecret}
            accept='.json'
            disabled={isLoading || canAuthenticate}
          />
          <div className={style.setupHint}>{getLocalizedString('settings.manage.gsheet_setup.upload_secret_hint')}</div>
        </Panel.ListGroup>
      )}
      {isAuthenticated && authError && (
        <Panel.ListGroup className={style.setupBlock}>
          <Panel.Error>{authError}</Panel.Error>
        </Panel.ListGroup>
      )}
      <Panel.ListGroup className={style.setupBlock}>
        <Panel.Description>{getLocalizedString('settings.manage.gsheet_setup.enter_id')}</Panel.Description>
        <Panel.Error>{worksheetError}</Panel.Error>
        <Input
          fluid
          value={sheetId}
          placeholder={getLocalizedString('settings.manage.gsheet_setup.enter_id_placeholder')}
          onChange={(event) => {
            setWorksheetError('');
            setSheetId(extractSheetId(event.target.value));
          }}
          disabled={isLoading || canAuthenticate}
        />
        <div className={style.setupHint}>{getLocalizedString('settings.manage.gsheet_setup.enter_id_hint')}</div>
      </Panel.ListGroup>
      {isAuthenticated ? (
        <Panel.ListGroup className={style.setupBlock}>
          <Panel.Description>{getLocalizedString('settings.manage.gsheet_setup.load_config')}</Panel.Description>
          <Panel.InlineElements wrap='wrap' className={style.setupActions}>
            <Button onClick={handleLoadSheet} disabled={!canLoadSheet || isLoading} loading={loading === 'load-sheet'}>
              <IoCloudDownloadOutline />
              {getLocalizedString('settings.manage.gsheet_setup.load_sheet')}
            </Button>
          </Panel.InlineElements>
        </Panel.ListGroup>
      ) : !canAuthenticate ? (
        <Panel.ListGroup className={style.setupBlock}>
          <Panel.Description>{getLocalizedString('settings.manage.gsheet_setup.generate_code')}</Panel.Description>
          <Panel.InlineElements wrap='wrap' className={style.setupActions}>
            <Button onClick={handleConnect} disabled={!canConnect || isLoading} loading={loading === 'connect'}>
              <IoCheckmark />
              {getLocalizedString('settings.manage.gsheet_setup.connect')}
            </Button>
          </Panel.InlineElements>
        </Panel.ListGroup>
      ) : (
        <Panel.ListGroup className={style.setupBlock}>
          <Panel.Description>{getLocalizedString('settings.manage.gsheet_setup.copy_code')}</Panel.Description>
          <Panel.InlineElements wrap='wrap' className={style.setupActions}>
            {isAuthenticating && <span>{getLocalizedString('settings.manage.gsheet_setup.authenticating')}</span>}
            <CopyTag copyValue={authKey ?? ''}>{authKey}</CopyTag>
            <Button onClick={handleAuthenticate} disabled={isLoading} loading={loading === 'authenticate'}>
              <IoShieldCheckmarkOutline />
              {getLocalizedString('settings.manage.gsheet_setup.authenticate')}
            </Button>
          </Panel.InlineElements>
          <div className={style.setupHint}>{getLocalizedString('settings.manage.gsheet_setup.copy_code_hint')}</div>
        </Panel.ListGroup>
      )}
    </Panel.Section>
  );
}
