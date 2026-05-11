import { Settings } from 'ontime-types';
import { PropsWithChildren, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { IoEyeOutline } from 'react-icons/io5';

import IconButton from '../../../../../common/components/buttons/IconButton';
import Input from '../../../../../common/components/input/input/Input';
import { isAlphanumeric } from '../../../../../common/utils/regex';
import { useTranslation } from '../../../../../translation/TranslationProvider';

import style from './GeneralPinInput.module.scss';

interface GeneralPinInputProps {
  register: UseFormRegister<Settings>;
  formName: keyof Settings;
  disabled?: boolean;
}

export default function GeneralPinInput({ register, formName, disabled }: PropsWithChildren<GeneralPinInputProps>) {
  const [isVisible, setVisible] = useState(false);
  const { getLocalizedString } = useTranslation();

  return (
    <div className={style.container}>
      <Input
        type={isVisible ? 'text' : 'password'}
        maxLength={4}
        {...register(formName, {
          pattern: {
            value: isAlphanumeric,
            message: getLocalizedString('settings.general.pin_input.error_alphanumeric'),
          },
        })}
        placeholder='-'
        disabled={disabled}
      />
      <IconButton
        onMouseDown={() => setVisible(true)}
        onMouseUp={() => setVisible(false)}
        variant='ghosted'
        aria-label={getLocalizedString('settings.general.pin_input.show_pin_aria')}
      >
        <IoEyeOutline />
      </IconButton>
    </div>
  );
}
