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
import RadioGroup from '../RadioGroup/RadioGroup';
import { GET_TECHICAL_DATA } from '@/graphql/queries/GetTechnicalData';

type ModalProps = {
  onClose: () => void;
};

type GroupSelection = {
  id: string;
  name: string;
};

// Пресеты для персонала: выбранный подставляет и комментарий, и сумму из тех.
// данных. Поля не прячем, а блокируем — учитель видит, что уйдёт в историю.
const COMMENT_PRESETS = [
  { value: 'custom', label: 'Обычный', comment: '', valueField: null },
  { value: 'workshop', label: 'Workshop', comment: 'Workshop', valueField: 'workshopValue' },
  { value: 'sport', label: 'Sporttime', comment: 'Sporttime', valueField: 'sportTimeValue' },
  { value: 'lesson', label: 'Lesson', comment: 'Lesson', valueField: 'lessonValue' },
] as const;

const COMMENT_MAX_LENGTH = 200;

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
  const [customComment, setCustomComment] = useState('');
  const [commentPreset, setCommentPreset] = useState('custom');
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

  const isStaff = user?.userLevel === 'TEACHER' || user?.userLevel === 'ADMIN';

  // Тарифы нужны только для пресетов, а их видит лишь персонал
  const { data: technicalData } = useQuery(GET_TECHICAL_DATA, { skip: !isStaff });

  const preset = COMMENT_PRESETS.find((item) => item.value === commentPreset);
  const comment = commentPreset === 'custom' ? customComment : (preset?.comment ?? '');

  // Сумму за workshop/sporttime/lesson берём из тех. данных. Если тариф там не
  // задан (null или 0), поле остаётся обычным — иначе перевести было бы нечем,
  // а кнопка при сумме '0' осталась бы активной и упёрлась в ошибку сервера.
  const presetAmount = preset?.valueField
    ? technicalData?.technicalData?.[preset.valueField] || ''
    : '';
  const amount = commentPreset === 'custom' ? coins : String(presetAmount);
  const amountLocked = commentPreset !== 'custom' && amount !== '';

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
    if (!selectedStudent.id || !amount) {
      setError('Выберите студента и укажите сумму');
      return;
    }

    if (isTransferringRef.current) return;
    isTransferringRef.current = true;

    try {
      await transferCoins({
        userId: user?.id,
        recieverId: selectedStudent.id,
        amount: Number(amount),
        comment,
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
    if (!user?.group?.id || !amount) {
      setError('Укажите сумму');
      return;
    }

    if (isTransferringRef.current) return;
    isTransferringRef.current = true;

    try {
      await transferCoinsToGroup({
        groupId: user.group.id,
        amount: Number(amount),
        comment,
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
    setCustomComment('');
    setCommentPreset('custom');
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

  // Группе начисляют только за Sport Time — остальные пресеты там не нужны
  const presetOptions = groupTransferMode
    ? COMMENT_PRESETS.filter((preset) => preset.value === 'custom' || preset.value === 'sport')
    : COMMENT_PRESETS;

  const commentSection = (
    <div className={styles['comment']}>
      <Subtitle noMargin>Комментарий</Subtitle>
      {isStaff && (
        <RadioGroup
          name="comment-preset"
          value={commentPreset}
          options={presetOptions}
          onChange={setCommentPreset}
        />
      )}
      <InputField
        value={comment}
        onChange={setCustomComment}
        disabled={commentPreset !== 'custom'}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Необязательно"
      />
    </div>
  );

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
                value={amount}
                onChange={setCoins}
                disabled={amountLocked}
                type="number"
                placeholder="Введите сумму"
              />
            </div>

            {commentSection}

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
              <>
                <div>
                  <Subtitle>Сумма</Subtitle>
                  <InputField
                    value={amount}
                    onChange={setCoins}
                    disabled={amountLocked}
                    type="number"
                    placeholder="Введите сумму"
                  />
                </div>

                {commentSection}
              </>
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
              ? !amount || transferGroupLoading
              : !selectedStudent.id || !amount || transferCoinsLoading
          }
        >
          Перевести
        </PrimaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(TransferCoinsModal);
