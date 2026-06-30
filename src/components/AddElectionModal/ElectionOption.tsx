import ActionButton from '../ActionButton/ActionButton';
import { InputField } from '../InputField/InputField';
import styles from './AddElectionModal.module.scss';

type ElectionOptionProps = {
  name: string;
  id: string;
  onChangeName: (value: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
};
export default function ElectionOption({
  name,
  id,
  onChangeName,
  onRemove,
  placeholder,
}: ElectionOptionProps) {
  function handleRemove() {
    if (onRemove) {
      onRemove(id);
    }
  }
  return (
    <div className={styles['option']}>
      <InputField value={name} onChange={onChangeName} placeholder={placeholder} />
      {onRemove && <ActionButton type="DELETE" onClick={handleRemove} />}
    </div>
  );
}
