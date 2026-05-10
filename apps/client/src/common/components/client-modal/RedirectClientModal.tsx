import { useState } from 'react';
import { IoArrowForward } from 'react-icons/io5';

import { navigatorConstants } from '../../../viewerConfig';
import useUrlPresets from '../../hooks-query/useUrlPresets';
import { setClientRemote } from '../../hooks/useSocket';
import { useTranslation } from '../../../translation/useTranslation';
import Button from '../buttons/Button';
import Dialog from '../dialog/Dialog';
import Info from '../info/Info';
import Input from '../input/input/Input';
import AppLink from '../link/app-link/AppLink';
import Select from '../select/Select';

import style from './RedirectClientModal.module.scss';

interface RedirectClientModalProps {
  id: string;
  name: string;
  currentPath: string;
  origin: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RedirectClientModal({ id, isOpen, name, currentPath, origin, onClose }: RedirectClientModalProps) {
  const { data } = useUrlPresets();
  const { getLocalizedString } = useTranslation();
  const [path, setPath] = useState(currentPath);
  const [selected, setSelected] = useState('/');

  const { setRedirect } = setClientRemote;

  const handleRedirect = (newPath: string) => {
    if (newPath === '/' || newPath === currentPath) {
      return;
    }

    if (newPath.startsWith('preset-')) {
      setRedirect({ target: id, redirect: newPath.slice(7) });
    } else {
      setRedirect({ target: id, redirect: newPath });
    }

    onClose();
  };

  const enabledPresets = data.filter((preset) => preset.enabled);

  const viewOptions = [
    ...navigatorConstants.map((view) => ({
      value: `/${view.url}`,
      label: getLocalizedString(view.translationKey),
    })),
    ...enabledPresets.map((preset) => ({
      value: `preset-${preset.alias}`,
      label: `URL Preset: ${preset.alias}`,
    })),
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      showBackdrop
      title={`${getLocalizedString('redirect_modal.redirect')}: ${name}`}
      bodyElements={
        <>
          <Info>
            {getLocalizedString('redirect_modal.body')}
            <br />
            <br />
            <AppLink search='settings=sharing__presets'>{getLocalizedString('redirect_modal.manage_presets')}</AppLink>
          </Info>
          <div className={style.inlineEntry}>
            <span className={style.label}>{getLocalizedString('redirect_modal.enter_path')}</span>
            <label className={style.textEntry}>
              {origin}
              <Input placeholder='eg. /timer' fluid value={path} onChange={(event) => setPath(event.target.value)} />
            </label>
            <Button
              variant='primary'
              aria-label={getLocalizedString('redirect_modal.redirect')}
              disabled={path === currentPath || path === ''}
              className={style.redirect}
              onClick={() => handleRedirect(path)}
            >
              {getLocalizedString('redirect_modal.redirect')}
              <IoArrowForward />
            </Button>
          </div>
          <div>
            <span className={style.label}>{getLocalizedString('redirect_modal.select_preset')}</span>
            <div className={style.inlineEntry}>
              <label className={style.textEntry}>
                {origin}
                <Select
                  fluid
                  options={viewOptions}
                  defaultValue={viewOptions[0].value}
                  onValueChange={(value) => {
                    if (value === null) return;
                    setSelected(value);
                  }}
                  disabled={enabledPresets.length === 0}
                />
              </label>
              <Button
                variant='primary'
                aria-label={getLocalizedString('redirect_modal.redirect_to_preset')}
                className={style.redirect}
                disabled={enabledPresets.length === 0 || selected === '/'}
                onClick={() => handleRedirect(selected)}
              >
                {getLocalizedString('redirect_modal.redirect')} <IoArrowForward />
              </Button>
            </div>
          </div>
        </>
      }
    />
  );
}
