import path from 'path';
import fs from 'fs';
import { Post, User } from '../../models/index.js';
import { broadcast } from '../../index.js'; // или путь где сервер
import { requireAuth, requireStaff } from '../auth.js';

// Картинки постов лежат в uploads/posts и упоминаются в тексте по этому пути
const POST_IMAGE_REGEX = /\/uploads\/posts\/[\w.-]+/g;

const ALLOWED_REACTIONS = ['👍🏻', '🤣', '👹', '❤️', '🎉', '😭', '👁️👄👁️'];

function deletePostImageFiles(urls) {
  for (const url of urls) {
    // basename отсекает попытки выйти из папки через ../
    const filePath = path.join(process.cwd(), 'uploads', 'posts', path.basename(url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export const postResolvers = {
  Query: {
    posts: async (_, __, context) => {
      const auth = requireAuth(context);
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['name', 'photoUrl'],
          },
        ],
      });

      const currentUser = await User.findByPk(auth.id);
      const myReactions = currentUser?.postReactions || {};

      return posts.map((post) => ({
        ...post.toJSON(),
        myReaction: myReactions[post.id] || null,
      }));
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
        const oldImages = post.text.match(POST_IMAGE_REGEX) || [];
        deletePostImageFiles(oldImages.filter((url) => !text.includes(url)));
        post.text = text;
      }
      if (title) {
        post.title = title;
      }
      await post.save();
      return post;
    },
    uploadPostImage: async (_, { file }, context) => {
      requireStaff(context);

      // graphql-upload-minimal может отдать файл в разных обёртках (см. uploadAvatar)
      let uploadData;
      if (file.file && file.file.createReadStream) {
        uploadData = file.file;
      } else if (file.promise && typeof file.promise.then === 'function') {
        uploadData = await file.promise;
      } else if (file.createReadStream) {
        uploadData = file;
      } else {
        throw new Error('Invalid file upload object');
      }

      const { createReadStream, mimetype } = uploadData;

      const extByMime = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
      const ext = extByMime[mimetype];
      if (!ext) throw new Error('Only JPEG, PNG, WEBP images are allowed');

      const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await new Promise((resolve, reject) => {
        const stream = createReadStream();
        const outStream = fs.createWriteStream(filePath);
        stream.pipe(outStream);
        stream.on('error', reject);
        outStream.on('finish', resolve);
      });

      return `/uploads/posts/${uniqueName}`;
    },

    deletePost: async (_, { id }, context) => {
      requireStaff(context);
      const post = await Post.findByPk(id);
      if (!post) throw new Error('Пост не найден');

      deletePostImageFiles(post.text.match(POST_IMAGE_REGEX) || []);
      await post.destroy();

      return post;
    },

    // Чистка картинок, загруженных в редакторе, но не попавших в пост
    deletePostImage: async (_, { url }, context) => {
      requireStaff(context);
      if (!/^\/uploads\/posts\/[\w.-]+$/.test(url)) {
        throw new Error('Некорректный url картинки');
      }
      deletePostImageFiles([url]);
      return true;
    },

    // Повторный клик по уже выбранной реакции снимает её
    setPostReaction: async (_, { postId, emoji }, context) => {
      const auth = requireAuth(context);
      if (!ALLOWED_REACTIONS.includes(emoji)) {
        throw new Error('Недопустимая реакция');
      }

      const post = await Post.findByPk(postId);
      if (!post) throw new Error('Пост не найден');

      const user = await User.findByPk(auth.id);
      if (!user) throw new Error('Пользователь не найден');

      const userReactions = { ...(user.postReactions || {}) };
      const previousEmoji = userReactions[postId] || null;
      const nextEmoji = previousEmoji === emoji ? null : emoji;

      const counts = { ...(post.reactions || {}) };
      if (previousEmoji) {
        const nextCount = (counts[previousEmoji] || 0) - 1;
        if (nextCount > 0) counts[previousEmoji] = nextCount;
        else delete counts[previousEmoji];
      }
      if (nextEmoji) {
        counts[nextEmoji] = (counts[nextEmoji] || 0) + 1;
      }

      if (nextEmoji) userReactions[postId] = nextEmoji;
      else delete userReactions[postId];

      await user.update({ postReactions: userReactions });
      await post.update({ reactions: counts });

      return {
        ...post.toJSON(),
        myReaction: nextEmoji,
      };
    },
  },

  Post: {
    reactions: (post) =>
      Object.entries(post.reactions || {}).map(([emoji, count]) => ({ emoji, count })),
  },
};
