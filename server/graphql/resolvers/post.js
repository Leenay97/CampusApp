import { Post, User } from '../../models/index.js';
import { broadcast } from '../../index.js'; // или путь где сервер
import { requireAuth, requireStaff } from '../auth.js';

export const postResolvers = {
  Query: {
    posts: async (_, __, context) => {
      requireAuth(context);
      return await Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['name', 'photoUrl'],
          },
        ],
      });
    },
  },
  Mutation: {
    createPost: async (_, { text, title, authorId }, context) => {
      const auth = requireStaff(context);
      if (String(auth.id) !== String(authorId)) {
        throw new Error('Нельзя публиковать посты от чужого имени');
      }
      if (!text || !title) {
        throw new Error('У поста должны быть текст и название');
      }

      const post = await Post.create({ text, title, authorId });

      broadcast({
        type: 'NEW_POST',
        payload: post.toJSON(),
      });

      return post;
    },
    updatePost: async (_, { id, text, title }, context) => {
      requireStaff(context);
      const post = await Post.findByPk(id);
      if (!post) throw new Error('Пост не найден');

      if (text) {
        post.text = text;
      }
      if (title) {
        post.title = title;
      }
      await post.save();
      return post;
    },
    deletePost: async (_, { id }, context) => {
      requireStaff(context);
      const post = await Post.findByPk(id);
      await post.destroy();

      return post;
    },
  },
};
