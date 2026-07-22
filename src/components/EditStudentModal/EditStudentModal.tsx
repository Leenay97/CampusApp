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
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import CoinHistoryModal from '../CoinHistoryModal/CoinHistoryModal';

type ModalProps = {
  student: User;
  onSubmit: () => void;
  onClose: () => void;
};

type EnglishLevelOption = {
  id: EnglishLevel;
  name: EnglishLevel;
};

type SelectOption = {
  id: string;
  name: string;
};

function EditStudentModal({ student, onSubmit, onClose }: ModalProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [name, setName] = useState<string>('');
  const [coins, setCoins] = useState<string>(student.coins ? String(student.coins) : '0');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevelOption>({
    id: student.englishLevel,
    name: student.englishLevel,
  });
  const [group, setGroup] = useState({ id: '', name: '' });
  const [englishClass, setEnglishClass] = useState({ id: '', name: '' });
  const [house, setHouse] = useState({ id: student.house?.id, name: student.house?.number });
  const [birthday, setBirthday] = useState<string>(student.birthday ?? '');
  const [updateUser] = useGlobalLoadingMutation(UPDATE_USER);
  const { data, loading: seasonLoading } = useQuery(GET_ACTIVE_SEASON);
  const { data: classesData, loading: classesLoading } = useQuery(GET_CLASSES);
  const { data: housesData, loading: housesLoading } = useQuery(GET_HOUSES);

  const loading = seasonLoading || classesLoading || housesLoading;

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
    setBirthday(student?.birthday ?? '');
  }, [student]);

  function handleChangeName(value: string) {
    setName(value);
  }

  function handleChangeGroup({ id, name }: SelectOption) {
    setGroup({ id, name });
  }

  function handleChangeClass({ id, name }: SelectOption) {
    setEnglishClass({ id, name });
  }

  function handleChangeCoins(value: string) {
    setCoins(value);
  }
  function handleChangeHouse({ id, name }: SelectOption) {
    setHouse({ id, name });
  }

  function handleChangeBirthday(value: string) {
    setBirthday(value);
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
        birthday: birthday || null,
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
        {loading && <Loader />}
        {!loading && (
          <>
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
            <div>
              <Subtitle>Дата рождения</Subtitle>
              <InputField type="date" value={birthday} onChange={handleChangeBirthday} />
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={() => setShowHistory(true)}>История coins</SecondaryButton>
        <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        <PrimaryButton onClick={handleUpdate}>Принять</PrimaryButton>
      </ModalFooter>
      {showHistory && (
        <CoinHistoryModal studentId={student.id} onClose={() => setShowHistory(false)} />
      )}
    </Modal>
  );
}

export default memo(EditStudentModal);
