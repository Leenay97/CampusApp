import styles from './House.module.scss';
import { useState } from 'react';
import HouseModal from '../HouseModal/HouseModal';
import Grade from '../GradeSection/Grade';
import { grades } from '../GradeSection/constants';

type HouseProps = {
  id: string;
  number: string;
  grade: number;
  refetchHouses: () => void;
};
export default function House({ id, number, grade, refetchHouses }: HouseProps) {
  const [showModal, setShowModal] = useState(false);

  function handleOpenModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    refetchHouses();
  }

  const gradeData = grade > 0 ? grades[grade] : null;
  console.log(gradeData);

  return (
    <div className={styles['house']} onClick={handleOpenModal}>
      <span>{number}</span>
      {showModal && <HouseModal id={id} number={number} onClose={handleCloseModal} />}

      {gradeData && <Grade selectedGrade={grade} value={gradeData} small />}
    </div>
  );
}
