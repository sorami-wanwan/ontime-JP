import { CustomViewSummary } from 'ontime-types';
import { useState } from 'react';

import { deleteCustomView } from '../../../../common/api/customViews';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Dialog from '../../../../common/components/dialog/Dialog';
import { useTranslation } from '../../../../translation/useTranslation';
import * as Panel from '../../panel-utils/PanelUtils';
import CustomViewsListItem from './CustomViewsListItem';

import style from './CustomViews.module.scss';

interface CustomViewsListProps {
  views: CustomViewSummary[];
  onOpenUpload: () => void;
  onMutate: () => void;
  onError: (message: string) => void;
}

export default function CustomViewsList({ views, onOpenUpload, onMutate, onError }: CustomViewsListProps) {
  const [targetSlug, setTargetSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { getLocalizedString } = useTranslation();

  const openDelete = (slug: string) => {
    setTargetSlug(slug);
  };

  const submitDelete = async () => {
    if (!targetSlug) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteCustomView(targetSlug);
      onMutate();
    } catch (error) {
      onError(maybeAxiosError(error));
    } finally {
      setIsDeleting(false);
      setTargetSlug(null);
    }
  };

  return (
    <>
      <Panel.Table>
        <thead>
          <tr>
            <th>{getLocalizedString('settings.manage.custom_views.table_name')}</th>
            <th>{getLocalizedString('settings.manage.custom_views.table_url')}</th>
            <th className={style.actionsHeader} />
          </tr>
        </thead>
        <tbody>
          {views.length === 0 && (
            <Panel.TableEmpty
              handleClick={onOpenUpload}
              label={getLocalizedString('settings.manage.custom_views.no_views')}
            />
          )}
          {views.map((view, index) => (
            <CustomViewsListItem
              key={view.slug}
              slug={view.slug}
              index={index}
              onDelete={openDelete}
              onError={onError}
            />
          ))}
        </tbody>
      </Panel.Table>
      <Dialog
        isOpen={targetSlug !== null}
        onClose={() => setTargetSlug(null)}
        title={getLocalizedString('settings.manage.custom_views.delete_title')}
        showBackdrop
        showCloseButton
        bodyElements={getLocalizedString('settings.manage.custom_views.delete_confirm')}
        footerElements={
          <>
            <Button size='large' onClick={() => setTargetSlug(null)}>
              {getLocalizedString('settings.manage.custom_views.cancel')}
            </Button>
            <Button variant='destructive' size='large' onClick={submitDelete} loading={isDeleting}>
              {getLocalizedString('settings.manage.custom_views.delete_button')}
            </Button>
          </>
        }
      />
    </>
  );
}
