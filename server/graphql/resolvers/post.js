import { Post, User } from '../../models/index.js';
import { broadcast } from '../../index.js'; // или путь где сервер

export const postResolvers = {
  Query: {
    posts: async () => {
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
    createPost: async (_, { text, title, authorId }) => {
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
    updatePost: async (_, { id, text, title }) => {
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
    deletePost: async (_, { id }) => {
      const post = await Post.findByPk(id);
      await post.destroy();

      return post;
    },
  },
};
