import { useEffect, useState } from 'react';
import Checkbox from '../Checkbox/Checkbox';
import styles from './style.module.scss';
import { InputField } from '../InputField/InputField';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import ColorPicker from '../ColorPicker/ColorPicker';

type Props = {
  color: string;
  changeColor: (color: string) => void;
  onCreate: (name: string, isTeam: boolean) => Promise<void>;
};

export default function AddPlaceForm({ color, changeColor, onCreate }: Props) {
  const [name, setName] = useState('');
  const [isTeam, setIsTeam] = useState(false);

  async function handleSubmit() {
    if (!name) return;
    try {
      await onCreate(name, isTeam);
      setName('');
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!isTeam) {
      changeColor('');
    }
  }, [isTeam, changeColor]);

  return (
    <div className={styles['add-place']}>
      <InputField value={name} onChange={setName} placeholder="Название места" />

      <Checkbox label="Team" checked={isTeam} onChange={(e) => setIsTeam(e.target.checked)} />
      {isTeam && <ColorPicker value={color} onChange={changeColor} />}
      <PrimaryButton onClick={handleSubmit}>Добавить</PrimaryButton>
    </div>
  );
}
