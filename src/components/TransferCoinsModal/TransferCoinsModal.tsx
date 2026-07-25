'use client';
import { memo, useEffect, useRef, useState } from 'react';
import styles from './TransferCoinsModal.module.scss';
import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import { ApolloError, useLazyQuery, useQuery } from '@apollo/client';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { GET_ACTIVE_SEASON } from '@/graphql/queries/GetActiveSeason';
import Subtitle from '../Subtitle/Subtitle';
import { GET_STUDENTS_BY_GROUP_ID } from '@/graphql/queries/GetStudentsByGroupId';
import { InputField } from '../InputField/InputField';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { TRANSFER_COINS } from '@/graphql/mutations/TransferCoins';
import { TRANSFER_COINS_TO_GROUP } from '@/graphql/mutations/TransferCoinsToGroup';
import { useUser } from '@/contexts/UserContext';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import { GetUserResponse, GetUserVariables } from '@/graphql/types';
import { GET_USER } from '@/graphql/queries/GetUser';
import Loader from '../Loader/Loaader';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';

type ModalProps = {
  onClose: () => void;
};

type GroupSelection = {
  id: string;
  name: string;
};

// Сетевой сбой (нет graphQLErrors) означает, что мы не знаем, дошёл ли запрос
// до сервера — перевод мог реально пройти. Явную ошибку от резолвера (например,
// "уже отправлено, подождите") показываем как есть — сервер точно её обработал.
function getTransferErrorMessage(err: unknown): string {
  if (err instanceof ApolloError && err.graphQLErrors.length === 0) {
    return 'Перевод мог уже пройти — проверьте историю coins';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Не удалось перевести coins';
}

function TransferCoinsModal({ onClose }: ModalProps) {
  const [selectedGroup, setSelectedGroup] = useState({ id: '', name: '' });
  const [selectedStudent, setSelectedStudent] = useState({ id: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coins, setCoins] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [groupTransferMode, setGroupTransferMode] = useState(false);
  const isTransferringRef = useRef(false);
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_ACTIVE_SEASON);
  const [getUser, { data: userData, loading: userLoading }] = useLazyQuery<
    GetUserResponse,
    GetUserVariables
  >(GET_USER);
  const { user } = useUser();

  const { data: studentsData } = useQuery(GET_STUDENTS_BY_GROUP_ID, {
    variables: { groupId: selectedGroup.id },
    skip: !selectedGroup.id,
  });

  const registeredStudents = (studentsData?.usersByGroup || []).filter(
    (student: { name?: string | null }) => student.name,
  );

  const [transferCoins, { loading: transferCoinsLoading }] =
    useGlobalLoadingMutation(TRANSFER_COINS);
  const [transferCoinsToGroup, { loading: transferGroupLoading }] =
    useGlobalLoadingMutation(TRANSFER_COINS_TO_GROUP);

  useEffect(() => {
    if (userData?.user && !scanCompleted) {
      setSelectedStudent({ id: userData.user.id, name: userData.user.name });
      setSelectedGroup({
        id: userData.user.group?.id || '',
        name: userData.user.group?.name || '',
      });
      setScanCompleted(true);
      setLoading(false);
      setShowScanner(false);
      setError('');
    }
  }, [userData, scanCompleted]);

  useEffect(() => {
    if (!showScanner) {
      setScanCompleted(false);
      setError('');
      setSelectedStudent({ id: '', name: '' });
      setSelectedGroup({ id: '', name: '' });
      setCoins('');
    }
  }, [showScanner]);

  function handleChangeGroup({ id, name }: GroupSelection) {
    setSelectedGroup({ id, name });
    setSelectedStudent({ id: '', name: '' });
    setCoins('');
  }

  async function handleScan(detectedCodes: IDetectedBarcode[]) {
    if (detectedCodes.length > 0 && !loading && !userLoading) {
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
        setScanCompleted(false);
      }
    }
  }

  async function transfer() {
    if (!selectedStudent.id || !coins) {
      setError('Выберите студента и укажите сумму');
      return;
    }

    if (isTransferringRef.current) return;
    isTransferringRef.current = true;

    try {
      await transferCoins({
        userId: user?.id,
        recieverId: selectedStudent.id,
        amount: Number(coins),
      });
      setCoins('');
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(getTransferErrorMessage(err));
    } finally {
      isTransferringRef.current = false;
    }
  }

  async function transferToGroup() {
    if (!user?.group?.id || !coins) {
      setError('Укажите сумму');
      return;
    }

    if (isTransferringRef.current) return;
    isTransferringRef.current = true;

    try {
      await transferCoinsToGroup({
        groupId: user.group.id,
        amount: Number(coins),
      });
      setCoins('');
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(getTransferErrorMessage(err));
    } finally {
      isTransferringRef.current = false;
    }
  }

  function toggleGroupTransferMode() {
    setGroupTransferMode((prev) => !prev);
    setError('');
    setCoins('');
  }

  function handleError(error: unknown) {
    console.error('Ошибка сканера:', error);
    setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    setShowScanner(false);
  }

  function toggleScanner() {
    setShowScanner((prev) => !prev);
    setError('');
  }

  const showLoader = userLoading || groupsLoading;

  if (showScanner) {
    return (
      <Modal onClose={onClose}>
        <ModalHeader title="Перевести Coins" onClose={onClose} />
        <ModalBody>
          <PrimaryButton onClick={toggleScanner}>Закрыть сканер</PrimaryButton>
          <div className={styles['scanner']}>
            <Scanner
              key="scanner"
              sound={false}
              onScan={handleScan}
              onError={handleError}
              formats={['qr_code']}
              constraints={{ facingMode: 'environment' }}
              allowMultiple={false}
              scanDelay={500}
            />
          </div>
          {error && <div className={styles['error']}>{error}</div>}
        </ModalBody>
        <ModalFooter>
          <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Перевести Coins" onClose={onClose} />

      <ModalBody>
        {showLoader && <Loader />}

        {!showLoader && groupTransferMode && (
          <>
            <div>
              <Subtitle>{user?.group?.name}</Subtitle>
              <InputField
                value={coins}
                onChange={setCoins}
                type="number"
                placeholder="Введите сумму"
              />
            </div>

            {error && <div className={styles['error']}>{error}</div>}
          </>
        )}

        {!showLoader && !groupTransferMode && (
          <>
            <PrimaryButton onClick={toggleScanner}>Перевести по QR</PrimaryButton>
            {user?.userLevel === 'TEACHER' && user?.group?.id && (
              <PrimaryButton onClick={toggleGroupTransferMode}>Перевести моей группе</PrimaryButton>
            )}
            <div>
              <Subtitle>Группа</Subtitle>
              <CustomSelect
                key={`group-select-${selectedGroup.id}`}
                items={groupsData?.activeSeason?.groups || []}
                onChange={handleChangeGroup}
                initValue={selectedGroup.name}
              />
            </div>

            {registeredStudents.length > 0 && (
              <div>
                <Subtitle>Студент</Subtitle>
                <CustomSelect
                  key={`student-select-${selectedStudent.id}`}
                  items={registeredStudents}
                  onChange={setSelectedStudent}
                  initValue={selectedStudent.name}
                />
              </div>
            )}

            {selectedGroup.id && selectedStudent.id && (
              <div>
                <Subtitle>Сумма</Subtitle>
                <InputField
                  value={coins}
                  onChange={setCoins}
                  type="number"
                  placeholder="Введите сумму"
                />
              </div>
            )}

            {error && <div className={styles['error']}>{error}</div>}
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <SecondaryButton onClick={groupTransferMode ? toggleGroupTransferMode : onClose}>
          {groupTransferMode ? 'Назад' : 'Отмена'}
        </SecondaryButton>
        <PrimaryButton
          onClick={groupTransferMode ? transferToGroup : transfer}
          disabled={
            groupTransferMode
              ? !coins || transferGroupLoading
              : !selectedStudent.id || !coins || transferCoinsLoading
          }
        >
          Перевести
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(TransferCoinsModal);
