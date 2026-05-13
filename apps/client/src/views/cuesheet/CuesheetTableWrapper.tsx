import { memo, use, useMemo } from 'react';

import EmptyPage from '../../common/components/state/EmptyPage';
import { PresetContext } from '../../common/context/PresetContext';
import useCustomFields from '../../common/hooks-query/useCustomFields';
import CuesheetDnd from './cuesheet-dnd/CuesheetDnd';
import { makeCuesheetColumns } from './cuesheet-table/cuesheet-table-elements/cuesheetColsFactory';
import CuesheetTable from './cuesheet-table/CuesheetTable';
import { useApplyCuesheetPolicy } from './useApplyCuesheetPolicy';

import { useTranslation } from '../../../translation/useTranslation';

export default memo(CuesheetTableWrapper);
function CuesheetTableWrapper() {
  const { data: customFields, status: customFieldStatus } = useCustomFields();
  const preset = use(PresetContext);
  const { cuesheetMode, setCuesheetMode } = useApplyCuesheetPolicy(preset);
  const { getLocalizedString } = useTranslation();

  const columns = useMemo(
    () => makeCuesheetColumns(customFields, cuesheetMode, preset, getLocalizedString as any),
    [customFields, cuesheetMode, preset, getLocalizedString],
  );

  const isLoading = !customFields || customFieldStatus === 'pending';

  return (
    <CuesheetDnd columns={columns}>
      {isLoading ? (
        <EmptyPage text='Loading...' />
      ) : (
        <CuesheetTable
          columns={columns}
          cuesheetMode={cuesheetMode}
          tableRoot='cuesheet'
          setCuesheetMode={setCuesheetMode}
        />
      )}
    </CuesheetDnd>
  );
}
