import { Op } from 'sequelize';
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

const DUPLICATE_TRANSFER_WINDOW_MS = 5000;

// Защита от повторной отправки перевода: если тот же отправитель только что
// перевёл ту же сумму тому же (или тем же) получателям, считаем это
// повтором — например, клиент не увидел ответ из-за обрыва сети и
// пользователь нажал "Перевести" ещё раз, хотя первый перевод уже прошёл.
export async function isDuplicateTransfer({ studentIds, counterpartyId, amount }) {
  const recent = await CoinTransaction.findOne({
    where: {
      studentId: studentIds,
      counterpartyId,
      amount,
      reason: 'transfer',
      createdAt: { [Op.gte]: new Date(Date.now() - DUPLICATE_TRANSFER_WINDOW_MS) },
    },
  });
  return Boolean(recent);
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
