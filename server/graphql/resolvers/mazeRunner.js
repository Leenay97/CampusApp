import { MazeRunnerEvent, MazeRunnerAttempt, User } from '../../models/index.js';
import { requireAuth, requireAdmin } from '../auth.js';

const LOCK_DURATION_MS = 2 * 60 * 1000;
const CODE_RE = /^\d{4,8}$/;

// Циклический код 1234 принимает и 2341/3412/4123 — проверяем подстрокой
// в коде, продублированном самом с собой.
function isCyclicMatch(guess, code) {
  if (guess.length !== code.length) return false;
  return (code + code).includes(guess);
}

function buildStatus(event, attempt) {
  const now = new Date();
  const isLocked = Boolean(attempt?.lockedUntil && attempt.lockedUntil > now);
  const isSolved = attempt?.isSolved ?? false;
  return {
    isActive: event?.isActive ?? false,
    codeLength: event?.code ? event.code.length : null,
    isSolved,
    lockedUntil: isLocked ? attempt.lockedUntil.toISOString() : null,
    codeword: isSolved ? (event?.codeword ?? null) : null,
  };
}

export const mazeRunnerResolvers = {
  Query: {
    mazeRunnerEvent: async (_, __, context) => {
      requireAdmin(context);
      return await MazeRunnerEvent.findOne();
    },
    mazeRunnerStatus: async (_, __, context) => {
      const auth = requireAuth(context);
      const event = await MazeRunnerEvent.findOne();
      const user = await User.findByPk(auth.id);
      if (!user?.groupId) return buildStatus(event, null);

      const attempt = await MazeRunnerAttempt.findOne({ where: { groupId: user.groupId } });
      return buildStatus(event, attempt);
    },
  },
  Mutation: {
    updateMazeRunnerEvent: async (_, { code, isCyclic, codeword, isActive }, context) => {
      requireAdmin(context);

      if (code !== undefined && code !== null && !CODE_RE.test(code)) {
        throw new Error('Код должен состоять из 4-8 цифр');
      }

      let event = await MazeRunnerEvent.findOne();
      const codeChanged = Boolean(event) && code !== undefined && code !== event.code;

      if (!event) {
        event = await MazeRunnerEvent.create({
          code: code ?? null,
          isCyclic: isCyclic ?? false,
          codeword: codeword ?? null,
          isActive: isActive ?? false,
        });
      } else {
        if (code !== undefined) event.code = code;
        if (isCyclic !== undefined) event.isCyclic = isCyclic;
        if (codeword !== undefined) event.codeword = codeword;
        if (isActive !== undefined) event.isActive = isActive;
        await event.save();
      }

      // Новый код — старая блокировка/решение групп больше не актуальны
      if (codeChanged) {
        await MazeRunnerAttempt.destroy({ where: {} });
      }

      return event;
    },

    submitMazeRunnerCode: async (_, { code }, context) => {
      const auth = requireAuth(context);
      const user = await User.findByPk(auth.id);
      if (!user?.groupId) throw new Error('У вас нет группы');

      const event = await MazeRunnerEvent.findOne();
      if (!event || !event.isActive) throw new Error('Ивент сейчас не запущен');
      if (!event.code) throw new Error('Код ивента не настроен');

      let attempt = await MazeRunnerAttempt.findOne({ where: { groupId: user.groupId } });
      if (!attempt) attempt = await MazeRunnerAttempt.create({ groupId: user.groupId });

      const now = new Date();
      const isLocked = Boolean(attempt.lockedUntil && attempt.lockedUntil > now);

      if (attempt.isSolved || isLocked) {
        return buildStatus(event, attempt);
      }

      if (!/^\d+$/.test(code)) throw new Error('Код должен содержать только цифры');

      const isCorrect = event.isCyclic ? isCyclicMatch(code, event.code) : code === event.code;

      if (isCorrect) {
        attempt.isSolved = true;
        attempt.solvedAt = now;
        attempt.lockedUntil = null;
      } else {
        attempt.lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);
      }
      await attempt.save();

      return buildStatus(event, attempt);
    },
  },
};
