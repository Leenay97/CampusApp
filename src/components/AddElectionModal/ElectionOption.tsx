import ActionButton from '../ActionButton/ActionButton';
import { InputField } from '../InputField/InputField';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import styles from './AddElectionModal.module.scss';

type GroupOption = {
  id: string;
  name: string;
};

type ElectionOptionProps = {
  name: string;
  id: string;
  onChangeName: (value: string) => void;
  onRemove?: (id: string) => void;
  placeholder?: string;
  groups?: GroupOption[];
  groupName?: string;
  onChangeGroup?: (group: GroupOption) => void;
};
export default function ElectionOption({
  name,
  id,
  onChangeName,
  onRemove,
  placeholder,
  groups,
  groupName,
  onChangeGroup,
}: ElectionOptionProps) {
  function handleRemove() {
    if (onRemove) {
      onRemove(id);
    }
  }
  return (
    <div className={styles['option']}>
      <div className={styles['option__row']}>
        <InputField value={name} onChange={onChangeName} placeholder={placeholder} />
        {onRemove && <ActionButton type="DELETE" onClick={handleRemove} />}
      </div>
      {groups && groups.length > 0 && onChangeGroup && (
        <CustomSelect
          items={groups}
          initValue={groupName}
          placeholder="Группа (опционально)"
          width="100%"
          hasCleanButton
          onChange={onChangeGroup}
        />
      )}
    </div>
  );
}
