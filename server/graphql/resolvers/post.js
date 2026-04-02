import { Post } from '../../models/index.js';

export const postResolvers = {
  Query: {
    posts: async () => {
      console.log('HERE');
      return await Post.findAll();
    },
  },
  Mutation: {
    createPost: async (_, { text, title }) => {
      if (!text || !title) throw new Error('У поста должны быть текст и название');

      return await Post.create({ text, title });
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
