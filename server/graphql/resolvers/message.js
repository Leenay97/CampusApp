import { Message, User } from '../../models/index.js';
import { pubsub } from '../pubsub.js';
import { Op } from 'sequelize';
import { withFilter } from 'graphql-subscriptions';
import { isStaff, requireAuth, requireStaff } from '../auth.js';

// Студент может читать и писать только в чат собственной группы;
// персоналу доступны все чаты, включая учительский.
// groupId берём из БД, а не из токена: токены регистрации его не содержат.
async function requireGroupAccess(context, groupId) {
  const auth = requireAuth(context);
  if (isStaff(auth)) return auth;

  const me = await User.findByPk(auth.id);
  if (!me || !me.groupId || String(me.groupId) !== String(groupId)) {
    throw new Error('Доступ запрещен');
  }
  return auth;
}

export const messageResolvers = {
  Query: {
    getMessages: async (_, { groupId }, context) => {
      await requireGroupAccess(context, groupId);
      return await Message.findAll({
        where: { groupId },
        include: [
          {
            model: User,
            as: 'author',
          },
        ],
      });
    },
  },
  Mutation: {
    sendMessage: async (_, { authorId, text, groupId, isStaffChat }, context) => {
      const { sendPushNotification } = context;
      const auth = requireAuth(context);
      if (String(auth.id) !== String(authorId)) {
        throw new Error('Нельзя отправлять сообщения от чужого имени');
      }
      if (isStaffChat) {
        requireStaff(context);
      } else {
        await requireGroupAccess(context, groupId);
      }

      if (!text) {
        throw new Error('Сообщение не может быть пустым');
      }

      const author = await User.findByPk(authorId);
      if (!author) {
        throw new Error('Пользователь не найден');
      }

      console.log('Author data:', author.toJSON());

      let recipients = [];

      if (isStaffChat) {
        recipients = await User.findAll({
          where: {
            userLevel: {
              [Op.in]: ['TEACHER', 'ADMIN'],
            },
          },
        });
      } else {
        recipients = await User.findAll({
          where: { groupId },
        });
      }

      const message = await Message.create({
        authorId,
        text,
        groupId: groupId,
      });

      const messageWithAuthor = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'author',
          },
        ],
      });

      console.log('Message with author:', messageWithAuthor.toJSON());

      const pubsubChannel = isStaffChat ? 'STAFF_MESSAGE_SENT' : 'MESSAGE_SENT';
      const payload = isStaffChat
        ? { staffMessageSent: messageWithAuthor }
        : { messageSent: messageWithAuthor };

      pubsub.publish(pubsubChannel, payload);

      const notificationTitle = isStaffChat
        ? `📩 Новое сообщение от ${author.name}`
        : `💬 ${author.name}`;
      const notificationUrl = isStaffChat ? '/staff-chat' : '/chat';

      // Пуши уходят в фоне: ответ мутации не ждёт web-push, иначе отправка
      // сообщения в большую группу подвисает на секунды
      Promise.allSettled(
        recipients
          .filter((recipient) => recipient.id !== authorId)
          .map((recipient) =>
            sendPushNotification(recipient.id, notificationTitle, text, notificationUrl),
          ),
      );

      return messageWithAuthor;
    },
  },
  Subscription: {
    messageSent: {
      // Подписчик получает только сообщения запрошенной группы,
      // а подписаться на чужую группу студент не может.
      subscribe: async (root, args, context, info) => {
        await requireGroupAccess(context, args.groupId);
        return withFilter(
          () => pubsub.asyncIterator('MESSAGE_SENT'),
          (payload) => String(payload.messageSent.groupId) === String(args.groupId),
        )(root, args, context, info);
      },
    },
    staffMessageSent: {
      subscribe: (_, __, context) => {
        requireStaff(context);
        return pubsub.asyncIterator('STAFF_MESSAGE_SENT');
      },
    },
  },
};
