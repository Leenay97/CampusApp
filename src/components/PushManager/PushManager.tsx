'use client';

import { useState, useEffect } from 'react';
import styles from './PushManager.module.scss';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushManager() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const [swReady, setSwReady] = useState<boolean>(false);

  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  useEffect(() => {
    const init = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);

        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
          });
          console.log('SW зарегистрирован:', registration);
          setSwReady(true);
          await checkSubscription();
        } catch (error) {
          console.error('SW регистрация ошибка:', error);
        }
      }
    };

    init();
  }, []);

  async function checkSubscription(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      setPermission(Notification.permission);
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
    }
  }

  async function subscribeToPush(): Promise<void> {
    setLoading(true);

    try {
      let currentPermission: NotificationPermission = Notification.permission;

      if (currentPermission === 'default') {
        currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);
      }

      if (currentPermission !== 'granted') {
        alert('Без разрешения уведомления не будут работать');
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log('SW готов:', registration);

      if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === '') {
        console.error('VAPID ключ не настроен!');
        alert('Ошибка: VAPID ключ не настроен. Проверьте .env.local');
        setLoading(false);
        return;
      }
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      console.log('Подписка создана:', subscription);

      const userId = localStorage.getItem('userId') || 'anonymous';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // ИСПРАВЛЕНО: добавил /api/ перед push/subscribe
      const response = await fetch(`${apiUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('✅ Уведомления включены! Они будут приходить даже когда телефон заблокирован');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }
    } catch (error) {
      console.error('Ошибка подписки:', error);
      alert('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribeFromPush(): Promise<void> {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        const userId = localStorage.getItem('userId') || 'anonymous';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        await fetch(`${apiUrl}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'X-User-Id': userId },
        });

        setIsSubscribed(false);
        alert('❌ Уведомления отключены');
      }
    } catch (error) {
      console.error('Ошибка отписки:', error);
      alert('Ошибка при отключении уведомлений');
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return <div>⚠️ Браузер не поддерживает уведомления</div>;
  }

  if (!swReady) {
    return <div>⏳ Загрузка Service Worker... Подождите</div>;
  }

  if (permission === 'denied') {
    return <div>🔕 Уведомления запрещены. Разрешите в настройках браузера</div>;
  }

  return (
    <button onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush} disabled={loading}>
      {loading ? 'Загрузка...' : isSubscribed ? 'Отключить уведомления' : 'Включить уведомления'}
    </button>
  );
}
