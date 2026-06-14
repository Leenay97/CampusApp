import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

import { sequelize, PushSubscription } from './models/index.js';
import { typeDefs } from './graphql/typeDefs/index.js';
import { resolvers } from './graphql/resolvers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;

const VAPID_PUBLIC_KEY = process.env.PUSH_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.PUSH_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('❌ Ошибка: PUSH_PUBLIC_KEY и PUSH_PRIVATE_KEY должны быть в .env файле');
  process.exit(1);
}

webpush.setVapidDetails('mailto:your-email@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const clients = new Set();

export function broadcast(event) {
  const msg = JSON.stringify(event);
  clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  });
}

async function sendPushNotification(userId, title, body, url = '/') {
  try {
    const subscriptions = await PushSubscription.findAll({ where: { userId } });

    if (subscriptions.length === 0) {
      console.log(`Нет push подписок для пользователя ${userId}`);
      return false;
    }

    let successCount = 0;
    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        expirationTime: null,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      const payload = JSON.stringify({ title, body, url });
      try {
        await webpush.sendNotification(subscription, payload);
        successCount++;
      } catch (error) {
        console.error(`❌ Ошибка отправки на ${sub.endpoint}:`, error.message);
        if (error.statusCode === 410) {
          await sub.destroy();
        }
      }
    }
    console.log(`✅ Push отправлен на ${successCount} устройств для пользователя ${userId}`);
    return successCount > 0;
  } catch (error) {
    console.error(`❌ Ошибка push для ${userId}:`, error);
    return false;
  }
}

const startServer = async () => {
  const app = express();

  const uploadDir = path.join(__dirname, 'uploads/avatars');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use(
    graphqlUploadExpress({
      maxFileSize: 5 * 1024 * 1024,
      maxFiles: 1,
    }),
  );

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // ======================
  // PUSH ENDPOINTS
  // ======================

  // Проверка статуса подписки
  app.get('/api/push/check', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      return res.json({ hasSubscription: false });
    }
    const subscription = await PushSubscription.findOne({ where: { userId } });
    res.json({ hasSubscription: !!subscription });
  });

  app.post('/api/push/subscribe', async (req, res) => {
    console.log('📥 Получен запрос на подписку');
    console.log('📦 Тело:', JSON.stringify(req.body, null, 2));

    const userId = req.headers['x-user-id'] || 'anonymous';
    const subscription = req.body;

    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.keys.p256dh
    ) {
      console.error('❌ Невалидная подписка');
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    try {
      const existing = await PushSubscription.findOne({
        where: { endpoint: subscription.endpoint },
      });

      if (existing) {
        await existing.update({
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        });
        console.log(`🔄 Подписка обновлена для ${userId}`);
      } else {
        await PushSubscription.create({
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        });
        console.log(`✅ Новая подписка создана для ${userId}`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`❌ Ошибка сохранения подписки:`, error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/push/unsubscribe', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous';

    try {
      await PushSubscription.destroy({ where: { userId } });
      console.log(`❌ Push подписки удалены для ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error(`❌ Ошибка удаления подписки:`, error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/push/test', async (req, res) => {
    const { userId, title, body } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const success = await sendPushNotification(
      userId,
      title || 'Тест уведомления',
      body || 'Это тестовое push-уведомление!',
    );

    res.json({ success });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      broadcast,
      sendPushNotification,
    }),
  });

  await server.start();
  server.applyMiddleware({ app });

  const httpServer = app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📱 Push endpoint: http://localhost:5000/api/push/subscribe`);
    console.log(`🔍 Check endpoint: http://localhost:5000/api/push/check`);
  });

  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
};

startServer();
