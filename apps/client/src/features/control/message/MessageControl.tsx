import { IoEye, IoEyeOffOutline } from 'react-icons/io5';

import IconButton from '../../../common/components/buttons/IconButton';
import {
  setMessage,
  useExternalMessageInput as useSecondaryMessageInput,
  useTimerMessageInput,
} from '../../../common/hooks/useSocket';
import { useTranslation } from '../../../translation/TranslationProvider';
import InputRow from './InputRow';
import TimerControlsPreview from './TimerViewControl';

export default function MessageControl() {
  return (
    <>
      <TimerControlsPreview />
      <TimerMessageInput />
      <SecondaryInput />
    </>
  );
}

function TimerMessageInput() {
  const { text, visible } = useTimerMessageInput();
  const { getLocalizedString } = useTranslation();

  return (
    <InputRow
      label={getLocalizedString('control.message.timer_message_label')}
      placeholder={getLocalizedString('control.message.timer_message_placeholder')}
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.timerText(newValue)}
    >
      <IconButton
        aria-label={getLocalizedString('control.message.timer_message_visibility')}
        onClick={() => setMessage.timerVisible(!visible)}
        variant={visible ? 'primary' : 'subtle'}
      >
        {visible ? <IoEye /> : <IoEyeOffOutline />}
      </IconButton>
    </InputRow>
  );
}

function SecondaryInput() {
  const { text, visible } = useSecondaryMessageInput();
  const { getLocalizedString } = useTranslation();

  const toggleSecondary = () => {
    if (visible) {
      setMessage.timerSecondarySource(null);
    } else {
      setMessage.timerSecondarySource('secondary');
    }
  };

  return (
    <InputRow
      label={getLocalizedString('control.message.secondary_message_label')}
      placeholder={getLocalizedString('control.message.secondary_message_placeholder')}
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.secondaryMessage(newValue)}
    >
      <IconButton
        aria-label={getLocalizedString('control.message.secondary_message_visibility')}
        onClick={toggleSecondary}
        variant={visible ? 'primary' : 'subtle'}
      >
        {visible ? <IoEye /> : <IoEyeOffOutline />}
      </IconButton>
    </InputRow>
  );
}
