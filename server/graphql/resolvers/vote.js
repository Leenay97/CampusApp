import { Vote, VoteOption, User } from '../../models/index.js';

const OPTIONS_ORDER = [['createdAt', 'ASC']];

export const voteResolvers = {
  Query: {
    getVotes: async (_, { seasonId, userId }) => {
      const votes = await Vote.findAll({
        where: { seasonId },
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
    createVote: async (_, { title, options, seasonId }) => {
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
          }),
        ),
      );

      return {
        ...vote.toJSON(),
        options: voteOptions,
      };
    },

    updateVote: async (_, { id, title, options }) => {
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

    deleteVote: async (_, { id }) => {
      const vote = await Vote.findByPk(id);
      if (!vote) throw new Error('Vote not found');

      await VoteOption.destroy({ where: { voteId: id } });
      await vote.destroy();

      return vote;
    },

    castVote: async (_, { voteId, optionId, userId }) => {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('Пользователь не найден');

      const userVotes = user.votes || {};
      const previousOptionId = userVotes[voteId] || null;

      if (previousOptionId) {
        const previousOption = await VoteOption.findOne({
          where: { id: previousOptionId, voteId },
        });
        if (previousOption) await previousOption.decrement('votesNumber');
      }

      const updatedVotes = { ...userVotes };
      let votedOptionId = null;

      if (previousOptionId !== optionId) {
        const option = await VoteOption.findOne({ where: { id: optionId, voteId } });
        if (!option) throw new Error('Опция голосования не найдена');

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
};
