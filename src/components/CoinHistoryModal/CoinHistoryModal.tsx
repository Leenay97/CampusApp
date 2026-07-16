'use client';
import { memo } from 'react';
import { useQuery } from '@apollo/client';
import styles from './CoinHistoryModal.module.scss';
import { GET_COIN_HISTORY } from '@/graphql/queries/GetCoinHistory';
import { CoinTransaction } from '@/app/types';
import Modal from '../Modal/Modal';
import ModalHeader from '../Modal/ModalHeader';
import ModalBody from '../Modal/ModalBody';
import ModalFooter from '../Modal/ModalFooter';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import Loader from '../Loader/Loaader';

type ModalProps = {
  studentId: string;
  onClose: () => void;
};

type GetCoinHistoryResponse = {
  coinHistory: CoinTransaction[];
};

function describeTransaction(transaction: CoinTransaction): string {
  const counterpartyName = transaction.counterparty?.name || '—';
  switch (transaction.reason) {
    case 'transfer':
      return transaction.amount > 0 ? `От: ${counterpartyName}` : `Кому: ${counterpartyName}`;
    case 'admin':
      return `Изменено: ${counterpartyName}`;
    case 'workshop':
      return 'Workshop';
    case 'sport':
      return 'Sport time';
    case 'lesson':
      return 'English lesson';
    default:
      return '—';
  }
}

type DateGroup = {
  dateLabel: string;
  transactions: CoinTransaction[];
};

// Транзакции приходят уже отсортированными по дате (DESC), поэтому группы
// достаточно собрать проходом без дополнительной сортировки.
function groupByDate(transactions: CoinTransaction[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const transaction of transactions) {
    const dateLabel = new Date(Number(transaction.createdAt)).toLocaleDateString('ru-RU');
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === dateLabel) {
      lastGroup.transactions.push(transaction);
    } else {
      groups.push({ dateLabel, transactions: [transaction] });
    }
  }
  return groups;
}

function CoinHistoryModal({ studentId, onClose }: ModalProps) {
  const { data, loading } = useQuery<GetCoinHistoryResponse>(GET_COIN_HISTORY, {
    variables: { studentId },
    skip: !studentId,
  });

  const transactions = data?.coinHistory ?? [];
  const dateGroups = groupByDate(transactions);

  return (
    <Modal onClose={onClose} className={styles['modal']}>
      <ModalHeader title={'История coins'} onClose={onClose} />
      <ModalBody>
        {loading && <Loader />}
        {!loading && transactions.length === 0 && (
          <div className={styles['empty']}>История пуста</div>
        )}
        {!loading && transactions.length > 0 && (
          <div className={styles['groups']}>
            {dateGroups.map((group) => (
              <div key={group.dateLabel} className={styles['group']}>
                <div className={styles['group__date']}>{group.dateLabel}</div>
                <div className={styles['list']}>
                  {group.transactions.map((transaction) => {
                    const time = new Date(Number(transaction.createdAt)).toLocaleTimeString(
                      'ru-RU',
                      { hour: '2-digit', minute: '2-digit' },
                    );
                    return (
                      <div key={transaction.id} className={styles['item']}>
                        <div className={styles['item__time']}>{time}</div>
                        <div className={styles['item__description']}>
                          {describeTransaction(transaction)}
                        </div>
                        <div
                          className={
                            transaction.amount > 0
                              ? styles['item__amount--positive']
                              : styles['item__amount--negative']
                          }
                        >
                          {transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <SecondaryButton onClick={onClose}>Закрыть</SecondaryButton>
      </ModalFooter>
    </Modal>
  );
}

export default memo(CoinHistoryModal);
