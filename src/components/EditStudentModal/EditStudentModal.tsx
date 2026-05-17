import { EnglishLevel, House, User } from '@/app/types';
import { memo, useEffect, useState } from 'react';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPDATE_USER } from '@/graphql/mutations/UpdateUser';
import { InputField } from '../InputField/InputField';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import Subtitle from '../Subtitle/Subtitle';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { useQuery } from '@apollo/client';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import { GET_CLASSES } from '@/graphql/queries/GetClasses';
import { GET_HOUSES } from '@/graphql/queries/GetHouses';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  student: User;
  onSubmit: () => void;
  onClose: () => void;
};

type EnglishLevelOption = {
  id: EnglishLevel;
  name: EnglishLevel;
};

function EditStudentModal({ student, onSubmit, onClose }: ModalProps) {
  const [name, setName] = useState<string>('');
  const [coins, setCoins] = useState<string>(student.coins ? String(student.coins) : '0');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevelOption>({
    id: student.englishLevel,
    name: student.englishLevel,
  });
  const [group, setGroup] = useState({ id: '', name: '' });
  const [englishClass, setEnglishClass] = useState({ id: '', name: '' });
  const [house, setHouse] = useState({ id: student.house?.id, name: student.house?.number });
  const [updateUser] = useGlobalLoadingMutation(UPDATE_USER);
  const { data } = useQuery(GET_ACTIVE_SEASON);
  const { data: classesData } = useQuery(GET_CLASSES);
  const { data: housesData } = useQuery(GET_HOUSES);

  const transformedHouses =
    housesData?.houses?.map((house: House) => ({
      id: house.id,
      name: house.number,
      number: house.number,
    })) || [];

  useEffect(() => {
    /*eslint-disable react-hooks/set-state-in-effect*/
    setName(student?.name);
    setGroup({ id: student?.group?.id ?? '', name: student?.group?.name ?? '' });
    setEnglishClass({ id: student?.class?.id ?? '', name: student?.class?.name ?? '' });
  }, [student]);

  function handleChangeName(value: string) {
    setName(value);
  }

  function handleChangeGroup({ id, name }: { id: string; name: string }) {
    setGroup({ id, name });
  }

  function handleChangeClass({ id, name }: { id: string; name: string }) {
    setEnglishClass({ id, name });
  }

  function handleChangeCoins(value: string) {
    setCoins(value);
  }
  function handleChangeHouse({ id, name }: { id: string; name: string }) {
    setHouse({ id, name });
  }

  function handleChangeEnglishLevel({ id, name }: EnglishLevelOption) {
    setEnglishLevel({ id, name });
  }

  async function handleUpdate() {
    try {
      await updateUser({
        id: student.id,
        name: name || null,
        groupId: group.id || null,
        classId: englishClass.id || null,
        coins: Number(coins) || null,
        houseId: house.id || null,
        englishLevel: englishLevel.id || null,
      });
      onClose();
      onSubmit();
    } catch (err) {
      console.error(err);
    }
  }
  const englishLevelOptions: EnglishLevelOption[] = [
    { id: 'A1', name: 'A1' },
    { id: 'A2', name: 'A2' },
    { id: 'B1', name: 'B1' },
    { id: 'B2', name: 'B2' },
    { id: 'C1', name: 'C1' },
    { id: 'C2', name: 'C2' },
  ];

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Изменить студента: ${student?.name}`} onClose={onClose} />
      <ModalBody>
        <div>
          <Subtitle>Имя</Subtitle>
          <InputField value={name} onChange={handleChangeName} />
        </div>
        <div>
          <Subtitle>Группа</Subtitle>
          <CustomSelect
            items={data?.activeSeason?.groups}
            onChange={handleChangeGroup}
            initValue={student.group ? student?.group.name : ''}
          />
        </div>
        <div>
          <Subtitle>Класс</Subtitle>
          <CustomSelect
            items={classesData?.classes}
            onChange={handleChangeClass}
            initValue={student.class ? student?.class.name : ''}
          />
        </div>
        <div>
          <Subtitle>Домик</Subtitle>
          <CustomSelect
            items={transformedHouses}
            onChange={handleChangeHouse}
            initValue={student.house?.number ? student?.house.number : ''}
          />
        </div>
        <div>
          <Subtitle>Уровень английского</Subtitle>
          <CustomSelect
            items={englishLevelOptions}
            onChange={handleChangeEnglishLevel}
            initValue={student.englishLevel ? student.englishLevel : ''}
          />
        </div>
        <div>
          <Subtitle>Coins</Subtitle>
          <InputField value={coins} onChange={handleChangeCoins} />
        </div>
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleUpdate}>Принять</PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(EditStudentModal);
