'use client';

import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import styles from './QRScanner.module.scss';
import SecondaryButton from '@components/SecondaryButton/SecondaryButton';
import Title from '../Title/Title';
import Subtitle from '../Subtitle/Subtitle';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { FINE_USER } from '@/graphql/mutations/FineUser';

type QRScannerModalProps = {
  isOpen: boolean;
  type: 'FINE' | 'TRANSFER';
  onClose: () => void;
  onScanSuccess: (qrData: string) => void;
};

function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fineUser] = useGlobalLoadingMutation(FINE_USER);

  if (typeof window === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleScan = async (results: any[]) => {
    if (results.length > 0 && !loading) {
      setLoading(true);
      setError('');

      try {
        const qrData = results[0].rawValue;

        if (!qrData) {
          throw new Error('QR-код не содержит данных');
        }

        fineUser({ id: qrData });

        onScanSuccess(qrData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сканирования');
        console.error('Ошибка:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (error: any) => {
    console.error('Ошибка сканера:', error);
    if (error.name === 'NotAllowedError') {
      setError('Нет доступа к камере. Пожалуйста, разрешите доступ.');
    } else if (error.name === 'NotFoundError') {
      setError('Камера не найдена на устройстве');
    } else {
      setError('Ошибка доступа к камере');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles['modal']} onClick={handleOverlayClick}>
      <div className={styles['modal__content']} onClick={handleContentClick}>
        <div className={styles['modal__header']}>
          <Title>Сканировать QR-код</Title>
          <div className={styles['close-button']} onClick={onClose}>
            &times;
          </div>
        </div>

        <div className={styles['modal__body']}>
          <Subtitle>Наведите камеру на QR-код</Subtitle>

          <div className={styles['qr-scanner__container']}>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              formats={['qr_code']}
              constraints={{ facingMode: 'environment' }}
              allowMultiple={false}
              scanDelay={500}
            />
          </div>

          {loading && (
            <div className={styles['qr-scanner__loading']}>
              <p>Обработка...</p>
            </div>
          )}

          {error && (
            <div className={styles['qr-scanner__error']}>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className={styles['modal__footer']}>
          <SecondaryButton onClick={onClose}>Закрыть</SecondaryButton>
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default memo(QRScannerModal);
