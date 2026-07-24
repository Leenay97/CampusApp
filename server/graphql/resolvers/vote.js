import { Vote, VoteOption, User, Group } from '../../models/index.js';
import { requireAuth, requireAdmin, requireSelfOrStaff } from '../auth.js';

const OPTIONS_ORDER = [['createdAt', 'ASC']];

export const voteResolvers = {
  Query: {
    getVotes: async (_, { seasonId, userId }, context) => {
      requireAuth(context);
      const where = { seasonId };
      if (userId) {
        where.status = ['ACTIVE', 'FINISHED'];
      }

      const votes = await Vote.findAll({
        where,
        include: [{ model: VoteOption, as: 'options' }],
        order: [[{ model: VoteOption, as: 'options' }, 'createdAt', 'ASC']],
      });

      if (!userId) return votes;

      const user = await User.findByPk(userId);
      const userVotes = user?.votes || {};

      return votes.map((vote) => ({
        ...vote.toJSON(),
        votedOptionId: userVotes[vote.id] || null,
      }));
    },
  },

  Mutation: {
    createVote: async (_, { title, options, seasonId }, context) => {
      requireAdmin(context);
      const vote = await Vote.create({
        title,
        seasonId,
      });

      const voteOptions = await Promise.all(
        options.map((option) =>
          VoteOption.create({
            name: option.name,
            votesNumber: option.votesNumber || 0,
            voteId: vote.id,
            groupId: option.groupId || null,
          }),
        ),
      );

      return {
        ...vote.toJSON(),
        options: voteOptions,
      };
    },

    updateVote: async (_, { id, title, options }, context) => {
      requireAdmin(context);
      const vote = await Vote.findByPk(id);
      if (!vote) throw new Error('Vote not found');

      if (title) {
        await vote.update({ title });
      }

      if (options && options.length > 0) {
        await VoteOption.destroy({ where: { voteId: id } });

        const newOptions = await Promise.all(
          options.map((option) =>
            VoteOption.create({
              name: option.name,
              votesNumber: option.votesNumber || 0,
              voteId: id,
              groupId: option.groupId || null,
            }),
          ),
        );

        return {
          ...vote.toJSON(),
          options: newOptions,
        };
      }

      const currentOptions = await VoteOption.findAll({
        where: { voteId: id },
        order: OPTIONS_ORDER,
      });

      return {
        ...vote.toJSON(),
        options: currentOptions,
      };
    },

    setVoteStatus: async (_, { id, status }, context) => {
      requireAdmin(context);
      const vote = await Vote.findByPk(id);
      if (!vote) throw new Error('Vote not found');

      await vote.update({ status });

      const options = await VoteOption.findAll({
        where: { voteId: id },
        order: OPTIONS_ORDER,
      });

      return {
        ...vote.toJSON(),
        options,
      };
    },

    deleteVote: async (_, { id }, context) => {
      requireAdmin(context);
      const vote = await Vote.findByPk(id);
      if (!vote) throw new Error('Vote not found');

      await VoteOption.destroy({ where: { voteId: id } });
      await vote.destroy();

      return vote;
    },

    castVote: async (_, { voteId, optionId, userId }, context) => {
      // Голосовать можно только от собственного имени
      requireSelfOrStaff(context, userId);
      const currentVote = await Vote.findByPk(voteId);
      if (!currentVote) throw new Error('Голосование не найдено');
      if (currentVote.status !== 'ACTIVE') throw new Error('Голосование не активно');

      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');

      const userVotes = user.votes || {};
      const previousOptionId = userVotes[voteId] || null;
      const isUnvoting = previousOptionId === optionId;

      let option = null;
      if (!isUnvoting) {
        option = await VoteOption.findOne({ where: { id: optionId, voteId } });
        if (!option) throw new Error('Опция голосования не найдена');
        if (option.groupId && user.groupId && option.groupId === user.groupId) {
          throw new Error('Нельзя голосовать за свою группу');
        }
      }

      if (previousOptionId) {
        const previousOption = await VoteOption.findOne({
          where: { id: previousOptionId, voteId },
        });
        if (previousOption) await previousOption.decrement('votesNumber');
      }

      const updatedVotes = { ...userVotes };
      let votedOptionId = null;

      if (!isUnvoting) {
        await option.increment('votesNumber');
        updatedVotes[voteId] = optionId;
        votedOptionId = optionId;
      } else {
        delete updatedVotes[voteId];
      }

      await user.update({ votes: updatedVotes });

      const vote = await Vote.findByPk(voteId, {
        include: [{ model: VoteOption, as: 'options' }],
        order: [[{ model: VoteOption, as: 'options' }, 'createdAt', 'ASC']],
      });

      return {
        ...vote.toJSON(),
        votedOptionId,
      };
    },
  },

  Vote: {
    options: async (vote) => {
      if (vote.options) return vote.options;
      return await VoteOption.findAll({
        where: { voteId: vote.id },
        order: OPTIONS_ORDER,
      });
    },
  },

  VoteOption: {
    group: async (option) => {
      if (!option.groupId) return null;
      return await Group.findByPk(option.groupId);
    },
  },
};
