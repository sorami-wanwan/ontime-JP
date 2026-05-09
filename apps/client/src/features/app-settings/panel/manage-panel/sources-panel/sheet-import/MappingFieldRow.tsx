import type { ReactNode } from 'react';
import { IoCheckmark } from 'react-icons/io5';

import AutocompleteInput from '../../../../../../common/components/autocomplete-input/AutocompleteInput';
import { cx } from '../../../../../../common/utils/styleUtils';
import type { TranslationKey } from '../../../../../../translation/TranslationProvider';
import { useTranslation } from '../../../../../../translation/useTranslation';
import type { MappingWarning } from './importMapUtils';

import style from './SheetImportEditor.module.scss';

export function getWarningText(warning: MappingWarning, t: (key: TranslationKey) => string): string {
  switch (warning.kind) {
    case 'duplicate':
      return t('settings.manage.sheet_import.warning_duplicate');
    case 'missing':
      return t('settings.manage.sheet_import.warning_missing');
    case 'invalid-name':
      return t('settings.manage.sheet_import.warning_invalid_name');
    case 'name-collision':
      return t('settings.manage.sheet_import.warning_name_collision');
    default:
      return '';
  }
}

interface MappingFieldRowProps {
  header: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  warning?: MappingWarning;
  options: string[];
  assigned: Set<string>;
  disabled?: boolean;
}

export default function MappingFieldRow({
  header,
  value,
  onValueChange,
  warning,
  options,
  assigned,
  disabled = false,
}: MappingFieldRowProps) {
  const { getLocalizedString } = useTranslation();
  const warningText = warning ? getWarningText(warning, getLocalizedString) : undefined;

  return (
    <div className={style.mappingField}>
      {header}
      {warningText && <span className={style.mappingFieldWarning}>{warningText}</span>}
      <AutocompleteInput
        className={cx([style.columnInput, warning && style.columnInputWarn])}
        maxLength={50}
        options={options}
        openOnFocus
        trailingElement={(option) => (assigned.has(option) ? <IoCheckmark /> : null)}
        placeholder={getLocalizedString('settings.manage.sheet_import.spreadsheet_column')}
        disabled={disabled}
        title={warningText}
        value={value}
        onValueChange={onValueChange}
      />
    </div>
  );
}
