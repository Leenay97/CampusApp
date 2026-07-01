'use client';

import { memo, useState, useEffect } from 'react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import styles from './FineStudentModal.module.scss';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import Subtitle from '../Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { FINE_USER } from '@/graphql/mutations/FineUser';
import { User } from '@/app/types';
import { GET_USER } from '@/graphql/queries/GetUser';
import { useLazyQuery } from '@apollo/client';
import { GetUserResponse, GetUserVariables } from '@/graphql/types';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type FineStudentModalProps = {
  onClose: () => void;
};

function FineStudentModal({ onClose }: FineStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fineUser, { loading: fineUserLoading }] = useGlobalLoadingMutation(FINE_USER);
  const [getUser, { data: userData, loading: userLoading }] = useLazyQuery<
    GetUserResponse,
    GetUserVariables
  >(GET_USER);
  const [student, setStudent] = useState<Partial<User> | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [scanCompleted, setScanCompleted] = useState(false);

  useEffect(() => {
    if (userData?.user && !scanCompleted) {
      setStudent({ id: userData.user.id, name: userData.user.name });
      setGroupName(userData.user.group?.name || '');
      setScanCompleted(true);
      setLoading(false);
    }
  }, [userData, scanCompleted]);

  const title = 'Оштрафовать';

  function handleClose() {
    resetState();
    onClose();
  }

  function resetState() {
    setStudent(null);
    setGroupName('');
    setError('');
    setLoading(false);
    setScanCompleted(false);
  }

  async function handleScan(detectedCodes: IDetectedBarcode[]) {
    if (detectedCodes.length > 0 && !loading && !userLoading && !student) {
      setLoading(true);
      setError('');

      try {
        const qrData = detectedCodes[0].rawValue;

        if (!qrData) {
          throw new Error('QR-код не содержит данных');
        }

        await getUser({ variables: { id: qrData } });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сканирования');
        console.error('Ошибка:', err);
        setLoading(false);
      }
    }
  }

  async function handleFine() {
    if (!student?.id) return;

    try {
      await fineUser({ id: student.id });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Ошибка:', err);
    }
  }

  function handleReset() {
    resetState();
  }

  function handleError(error: unknown) {
    console.error('Ошибка сканера:', error);
    setError('Не удалось получить доступ к камере. Проверьте разрешения.');
  }

  const showScanner = !student && !userLoading && !scanCompleted;
  const showStudentInfo = student && scanCompleted;
  const showLoading = userLoading || loading;

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={title} onClose={onClose} />

      {showLoading && <Loader />}

      {showScanner && !showLoading && (
        <ModalBody>
          <Subtitle>Наведите камеру на QR-код</Subtitle>

          <div className={styles['scanner']}>
            <Scanner
              key="qr-scanner"
              sound={false}
              onScan={handleScan}
              onError={handleError}
              formats={['qr_code']}
              constraints={{ facingMode: 'environment' }}
              allowMultiple={false}
              scanDelay={500}
            />
          </div>

          {error && (
            <div>
              <p>{error}</p>
            </div>
          )}
        </ModalBody>
      )}

      {showStudentInfo && !showLoading && (
        <div className={styles['fine-modal__student-info']}>
          <div className={styles['fine-modal__info-item']}>
            Имя: <span>{student.name}</span>
          </div>
          <div className={styles['fine-modal__info-item']}>
            Группа: <span>{groupName}</span>
          </div>
          {error && (
            <div className={styles['fine-modal__error']}>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      <ModalFooter>
        {showStudentInfo ? (
          <>
            <SecondaryButton onClick={handleReset}>Сканировать</SecondaryButton>
            <PrimaryButton onClick={handleFine} disabled={fineUserLoading}>
              {title}
            </PrimaryButton>
          </>
        ) : (
          <SecondaryButton onClick={handleClose}>Закрыть</SecondaryButton>
        )}
      </ModalFooter>
    </Modal>
  );
}

export default memo(FineStudentModal);
