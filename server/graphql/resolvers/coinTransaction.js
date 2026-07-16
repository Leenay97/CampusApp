import { CoinTransaction, User } from '../../models/index.js';
import { requireSelfOrStaff } from '../auth.js';

// Общий хелпер: пишет одну запись в историю coins студента.
// Вызывается рядом с каждым местом, где меняется User.coins.
export async function logCoinTransaction({
  studentId,
  amount,
  counterpartyId = null,
  reason = null,
}) {
  return await CoinTransaction.create({ studentId, amount, counterpartyId, reason });
}

export const coinTransactionResolvers = {
  Query: {
    coinHistory: async (_, { studentId }, context) => {
      requireSelfOrStaff(context, studentId);
      return await CoinTransaction.findAll({
        where: { studentId },
        include: [{ model: User, as: 'counterparty' }],
        order: [['createdAt', 'DESC']],
      });
    },
  },
};
