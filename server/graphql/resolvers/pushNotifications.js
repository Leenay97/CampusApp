import { User, PushSubscription } from '../../models/index.js';
import { requireStaff } from '../auth.js';

export const pushResolvers = {
  Mutation: {
    sendPushToStaff: async (_, { title, body, url }, context) => {
      const { sendPushNotification } = context;
      requireStaff(context);
      const staffUsers = await User.findAll({
        where: { accountLevel: ['TEACHER', 'ADMIN'] },
      });

      if (!staffUsers.length) {
        throw new Error('Нет пользователей с уровнем TEACHER или ADMIN');
      }

      let successCount = 0;
      for (const user of staffUsers) {
        const success = await sendPushNotification(user.id, title, body, url || '/');
        if (success) successCount++;
      }

      return successCount > 0;
    },

    sendPushToGroup: async (_, { groupId, title, body, url }, context) => {
      const { sendPushNotification } = context;
      requireStaff(context);
      const usersInGroup = await User.findAll({
        where: { groupId },
      });

      if (!usersInGroup.length) {
        throw new Error(`Нет пользователей в группе ${groupId}`);
      }

      let successCount = 0;
      for (const user of usersInGroup) {
        const success = await sendPushNotification(user.id, title, body, url || '/');
        if (success) successCount++;
      }

      return successCount > 0;
    },

    sendPushToUser: async (_, { userId, title, body, url }, context) => {
      const { sendPushNotification } = context;
      requireStaff(context);
      const success = await sendPushNotification(userId, title, body, url || '/');
      if (!success) {
        throw new Error(`Не удалось отправить уведомление пользователю ${userId}`);
      }
      return true;
    },

    sendPushToAll: async (_, { title, body, url }, context) => {
      const { sendPushNotification } = context;
      requireStaff(context);
      const allSubscriptions = await PushSubscription.findAll();
      const userIds = [...new Set(allSubscriptions.map((s) => s.userId))];

      if (!userIds.length) {
        throw new Error('Нет активных подписок');
      }

      let successCount = 0;
      for (const userId of userIds) {
        const success = await sendPushNotification(userId, title, body, url || '/');
        if (success) successCount++;
      }

      return successCount > 0;
    },
  },
};
