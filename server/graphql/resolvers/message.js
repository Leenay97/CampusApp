import { Message, User } from '../../models/index.js';
import { pubsub } from '../pubsub.js';
import { Op } from 'sequelize';

export const messageResolvers = {
  Query: {
    getMessages: async (_, { groupId }) => {
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
    sendMessage: async (_, { authorId, text, groupId, isStaffChat }, { sendPushNotification }) => {
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

      for (const recipient of recipients) {
        if (recipient.id !== authorId) {
          await sendPushNotification(recipient.id, notificationTitle, text, notificationUrl);
        }
      }

      return messageWithAuthor;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: (_, { groupId }) => {
        return pubsub.asyncIterator('MESSAGE_SENT');
      },
    },
    staffMessageSent: {
      subscribe: (_) => {
        return pubsub.asyncIterator('STAFF_MESSAGE_SENT');
      },
    },
  },
};
