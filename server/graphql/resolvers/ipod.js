import { IpodPair, IpodMatch, IpodTournament, User, Group } from '../../models/index.js';
import { requireAuth, requireStaff, requireAdmin } from '../auth.js';

const DRAW_ID = 'DRAW';

async function getCurrentRound(seasonId) {
  const tournament = await IpodTournament.findOne({ where: { seasonId } });
  return tournament?.currentRound ?? 1;
}

function formatRoundNames(roundNames) {
  return Object.entries(roundNames || {}).map(([round, name]) => ({
    round: Number(round),
    name,
  }));
}

async function getEligiblePairsForRound(seasonId, round) {
  if (round === 1) {
    const [pairs, matches] = await Promise.all([
      IpodPair.findAll({ where: { seasonId } }),
      IpodMatch.findAll({ where: { seasonId } }),
    ]);
    const usedPairIds = new Set(matches.flatMap((match) => match.pairIds));
    return pairs.filter((pair) => !usedPairIds.has(pair.id));
  }

  const [previousRoundMatches, currentRoundMatches] = await Promise.all([
    IpodMatch.findAll({ where: { seasonId, round: round - 1 } }),
    IpodMatch.findAll({ where: { seasonId, round } }),
  ]);

  const advancedIds = previousRoundMatches.flatMap((match) => {
    if (match.winnerId === DRAW_ID) {
      return match.pairIds;
    }
    return match.winnerId ? [match.winnerId] : [];
  });

  const usedThisRoundIds = new Set(currentRoundMatches.flatMap((match) => match.pairIds));
  const eligibleIds = advancedIds.filter((id) => !usedThisRoundIds.has(id));

  if (!eligibleIds.length) return [];

  return await IpodPair.findAll({ where: { id: eligibleIds } });
}

export const ipodResolvers = {
  Query: {
    ipodPairs: async (_, { seasonId }, context) => {
      requireAuth(context);
      return await IpodPair.findAll({ where: { seasonId }, order: [['createdAt', 'ASC']] });
    },
    ipodMatches: async (_, { seasonId }, context) => {
      requireAuth(context);
      return await IpodMatch.findAll({ where: { seasonId }, order: [['date', 'ASC']] });
    },
    ipodWaitingPairs: async (_, { seasonId }, context) => {
      requireAuth(context);
      const currentRound = await getCurrentRound(seasonId);
      return await getEligiblePairsForRound(seasonId, currentRound);
    },
    ipodTournament: async (_, { seasonId }, context) => {
      requireAuth(context);
      const tournament = await IpodTournament.findOne({ where: { seasonId } });
      return {
        seasonId,
        currentRound: tournament?.currentRound ?? 1,
        roundNames: formatRoundNames(tournament?.roundNames),
      };
    },
  },

  Mutation: {
    createIpodPair: async (_, { name, studentIds, seasonId }, context) => {
      const auth = requireStaff(context);
      if (!name || !name.trim()) {
        throw new Error('Введите название команды');
      }
      if (!studentIds || studentIds.length < 2 || studentIds.length > 3) {
        throw new Error('В паре должно быть 2 или 3 студента');
      }

      const currentRound = await getCurrentRound(seasonId);
      if (currentRound > 1) {
        throw new Error('Приём новых пар закрыт — тур 1 уже завершён');
      }

      const students = await User.findAll({
        where: { id: studentIds, userLevel: 'STUDENT' },
      });
      if (students.length !== studentIds.length) {
        throw new Error('Студенты не найдены');
      }

      return await IpodPair.create({
        name: name.trim(),
        studentIds,
        seasonId,
        creatorId: auth.id,
      });
    },

    deleteIpodPair: async (_, { id }, context) => {
      requireAdmin(context);
      const pair = await IpodPair.findByPk(id);
      if (!pair) throw new Error('Пара не найдена');

      const matches = await IpodMatch.findAll({ where: { seasonId: pair.seasonId } });
      const isMatched = matches.some((match) => match.pairIds.includes(id));
      if (isMatched) {
        throw new Error('Нельзя удалить пару, которая уже участвует в матче');
      }

      await pair.destroy();
      return pair;
    },

    createIpodMatch: async (_, { pairIds, seasonId, date }, context) => {
      requireAdmin(context);
      if (!pairIds || pairIds.length < 2 || pairIds.length > 3) {
        throw new Error('В матче должно быть 2 или 3 пары');
      }
      const parsedDate = new Date(date);
      if (!date || Number.isNaN(parsedDate.getTime())) {
        throw new Error('Некорректная дата');
      }

      const currentRound = await getCurrentRound(seasonId);
      const eligiblePairs = await getEligiblePairsForRound(seasonId, currentRound);
      const eligibleIds = new Set(eligiblePairs.map((pair) => pair.id));
      if (!pairIds.every((id) => eligibleIds.has(id))) {
        throw new Error('Одна из пар недоступна для этого тура');
      }

      return await IpodMatch.create({ pairIds, seasonId, round: currentRound, date: parsedDate });
    },

    setIpodMatchWinner: async (_, { id, winnerId }, context) => {
      requireAdmin(context);
      const match = await IpodMatch.findByPk(id);
      if (!match) throw new Error('Матч не найден');
      if (!match.pairIds.includes(winnerId) && winnerId !== DRAW_ID) {
        throw new Error('Победитель должен быть участником матча');
      }

      const currentRound = await getCurrentRound(match.seasonId);
      if (match.round < currentRound) {
        throw new Error('Тур уже закрыт — нельзя изменить победителя');
      }

      if (winnerId === DRAW_ID) {
        match.winnerId = DRAW_ID;
      } else {
        match.winnerId = winnerId;
      }

      await match.save();
      return match;
    },

    setIpodMatchDate: async (_, { id, date }, context) => {
      requireAdmin(context);
      const match = await IpodMatch.findByPk(id);
      if (!match) throw new Error('Матч не найден');

      const parsedDate = new Date(date);
      if (!date || Number.isNaN(parsedDate.getTime())) {
        throw new Error('Некорректная дата');
      }

      match.date = parsedDate;
      await match.save();
      return match;
    },

    advanceIpodRound: async (_, { seasonId }, context) => {
      requireAdmin(context);
      const currentRound = await getCurrentRound(seasonId);

      const currentRoundMatches = await IpodMatch.findAll({
        where: { seasonId, round: currentRound },
      });

      if (!currentRoundMatches.length) {
        throw new Error('Нельзя закрыть тур без матчей');
      }

      const hasUnresolvedMatch = currentRoundMatches.some((match) => !match.winnerId);
      if (hasUnresolvedMatch) {
        throw new Error('Не у всех матчей этого тура определён результат');
      }

      const [tournament] = await IpodTournament.findOrCreate({
        where: { seasonId },
        defaults: { seasonId, currentRound: 1 },
      });
      tournament.currentRound = currentRound + 1;
      await tournament.save();

      return {
        seasonId,
        currentRound: tournament.currentRound,
        roundNames: formatRoundNames(tournament.roundNames),
      };
    },

    setIpodRoundName: async (_, { seasonId, round, name }, context) => {
      requireAdmin(context);
      if (!name || !name.trim()) {
        throw new Error('Введите название тура');
      }

      const [tournament] = await IpodTournament.findOrCreate({
        where: { seasonId },
        defaults: { seasonId, currentRound: 1 },
      });
      tournament.roundNames = { ...(tournament.roundNames || {}), [round]: name.trim() };
      await tournament.save();

      return {
        seasonId,
        currentRound: tournament.currentRound,
        roundNames: formatRoundNames(tournament.roundNames),
      };
    },
  },

  IpodPair: {
    students: async (pair) => {
      return await User.findAll({
        where: { id: pair.studentIds },
        include: [{ model: Group, as: 'group' }],
      });
    },
  },

  IpodMatch: {
    date: (match) => (match.date ? new Date(match.date).toISOString() : null),
    pairs: async (match) => {
      return await IpodPair.findAll({ where: { id: match.pairIds } });
    },
    winner: async (match) => {
      if (!match.winnerId || match.winnerId === DRAW_ID) return null;
      return await IpodPair.findByPk(match.winnerId);
    },
    isDraw: (match) => match.winnerId === DRAW_ID,
  },
};
