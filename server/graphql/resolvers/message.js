import { Message, User } from '../../models/index.js';
import { pubsub } from '../pubsub.js';

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
    sendMessage: async (_, { authorId, text, groupId }, { sendPushNotification }) => {
      if (!text) {
        throw new Error('Сообщение не может быть пустым');
      }
      const message = await Message.create({ authorId, text, groupId });

      const messageWithAuthor = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'author',
          },
        ],
      });

      pubsub.publish('MESSAGE_SENT', {
        messageSent: messageWithAuthor,
      });

      const author = await User.findByPk(authorId);
      const groupUsers = await User.findAll({
        where: { groupId },
      });

      for (const user of groupUsers) {
        if (user.id !== authorId) {
          await sendPushNotification(user.id, `💬 ${author.name}`, text, '/chat');
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
  },
};
