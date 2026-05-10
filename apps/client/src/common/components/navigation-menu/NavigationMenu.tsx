import { Dialog } from '@base-ui/react/dialog';
import { useDisclosure, useFullscreen } from '@mantine/hooks';
import { memo } from 'react';
import { IoClose, IoContract, IoExpand, IoLockClosedOutline, IoSwapVertical } from 'react-icons/io5';
import { LuCoffee } from 'react-icons/lu';
import { useLocation } from 'react-router';

import { isLocalhost, supportsFullscreen } from '../../../externals';
import { canUseWakeLock, useKeepAwakeOptions } from '../../../features/keep-awake/useWakeLock';
import { useTranslation } from '../../../translation/useTranslation';
import { navigatorConstants } from '../../../viewerConfig';
import { useIsSmallScreen } from '../../hooks/useIsSmallScreen';
import { useClientStore } from '../../stores/clientStore';
import { useViewOptionsStore } from '../../stores/viewOptions';
import IconButton from '../buttons/IconButton';
import { RenameClientModal } from '../client-modal/RenameClientModal';
import ClientLink from './client-link/ClientLink';
import EditorNavigation from './editor-navigation/EditorNavigation';
import NavigationMenuItem from './navigation-menu-item/NavigationMenuItem';
import OtherAddresses from './other-addresses/OtherAddresses';

import style from './NavigationMenu.module.scss';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default memo(NavigationMenu);
function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const id = useClientStore((store) => store.id);
  const name = useClientStore((store) => store.name);
  const isSmallScreen = useIsSmallScreen();
  const { getLocalizedString } = useTranslation();

  const [isRenameOpen, handlers] = useDisclosure(false);
  const { fullscreen, toggle } = useFullscreen();
  const { mirror, toggleMirror } = useViewOptionsStore();
  const { keepAwake, toggleKeepAwake } = useKeepAwakeOptions();
  const location = useLocation();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={style.backdrop} />
        <RenameClientModal id={id} name={name} isOpen={isRenameOpen} onClose={handlers.close} />
        <Dialog.Popup className={style.drawer}>
          <div className={style.header}>
            <Dialog.Title>Ontime</Dialog.Title>
            <IconButton variant='subtle-white' size='large' onClick={onClose}>
              <IoClose />
            </IconButton>
          </div>
          <div className={style.body}>
            {supportsFullscreen && (
              <NavigationMenuItem active={fullscreen} onClick={toggle}>
                {getLocalizedString('navigation.toggle_fullscreen')}
                {fullscreen ? <IoContract /> : <IoExpand />}
              </NavigationMenuItem>
            )}
            <NavigationMenuItem active={mirror} onClick={() => toggleMirror()}>
              {getLocalizedString('navigation.flip_screen')}
              <IoSwapVertical />
              {mirror && <span className={style.note}>{getLocalizedString('navigation.active')}</span>}
            </NavigationMenuItem>
            {canUseWakeLock && (
              <NavigationMenuItem active={keepAwake} onClick={toggleKeepAwake}>
                {getLocalizedString('navigation.keep_awake')}
                <LuCoffee />
                {keepAwake && <span className={style.note}>{getLocalizedString('navigation.active')}</span>}
              </NavigationMenuItem>
            )}
            <NavigationMenuItem onClick={handlers.open}>{getLocalizedString('navigation.rename_client')}</NavigationMenuItem>

            <hr className={style.separator} />

            <EditorNavigation />
            <ClientLink
              to='cuesheet'
              current={location.pathname === '/cuesheet'}
              postAction={isSmallScreen ? onClose : undefined}
            >
              <IoLockClosedOutline />
              {getLocalizedString('navigation.cuesheet')}
            </ClientLink>
            <ClientLink to='op' current={location.pathname === '/op'} postAction={isSmallScreen ? onClose : undefined}>
              <IoLockClosedOutline />
              {getLocalizedString('navigation.operator')}
            </ClientLink>

            <hr className={style.separator} />

            {navigatorConstants.map((route) => (
              <ClientLink
                key={route.url}
                to={route.url}
                current={location.pathname === `/${route.url}`}
                postAction={isSmallScreen ? onClose : undefined}
              >
                {getLocalizedString(route.translationKey)}
              </ClientLink>
            ))}
          </div>

          {isLocalhost && (
            <div>
              <OtherAddresses currentLocation={location.pathname} />
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
