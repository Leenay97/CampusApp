import { Op } from 'sequelize';
import { CoinTransaction, User } from '../../models/index.js';
import { requireSelfOrStaff } from '../auth.js';

// Общий хелпер: пишет одну запись в историю coins студента.
// Вызывается рядом с каждым местом, где меняется User.coins.
// transaction передаём, когда запись должна коммититься/откатываться вместе
// с самим изменением баланса (см. transferCoins).
export async function logCoinTransaction(
  { studentId, amount, counterpartyId = null, reason = null },
  transaction,
) {
  return await CoinTransaction.create(
    { studentId, amount, counterpartyId, reason },
    { transaction },
  );
}

// Комментарий к переводу отдельной колонки не имеет — он кладётся в reason
// вместо служебного 'transfer'/'group_transfer'. Текст пишет человек, поэтому
// обрезаем до длины колонки (STRING = VARCHAR(255)) и пустую строку гасим в null.
export const COMMENT_MAX_LENGTH = 200;

// Служебные коды reason, по которым история рисует системные записи. Комментарий,
// буквально совпавший с кодом, выглядел бы в истории как автоматическое
// начисление за МК или правка админа — поэтому такие тексты не принимаем.
// Сравнение точное: пресеты присылают 'Workshop'/'Sporttime'/'Lesson' с большой
// буквы, они с кодами не пересекаются.
const RESERVED_REASONS = ['transfer', 'group_transfer', 'admin', 'workshop', 'sport', 'lesson'];

export function normalizeComment(comment) {
  const trimmed = comment?.trim();
  if (!trimmed) return null;
  if (RESERVED_REASONS.includes(trimmed)) {
    throw new Error('Такой комментарий использовать нельзя — напишите иначе');
  }
  return trimmed.slice(0, COMMENT_MAX_LENGTH);
}

const DUPLICATE_TRANSFER_WINDOW_MS = 5000;

// Защита от повторной отправки перевода: если тот же отправитель только что
// перевёл ту же сумму тому же (или тем же) получателям, считаем это
// повтором — например, клиент не увидел ответ из-за обрыва сети и
// пользователь нажал "Перевести" ещё раз, хотя первый перевод уже прошёл.
// transaction обязателен: проверку нужно делать после блокировки строк
// отправителя, иначе два параллельных запроса оба увидят пустую историю.
// reason разделяет личные и групповые переводы: с общим reason перевод группе
// считался повтором личного перевода любому её участнику на ту же сумму.
export async function isDuplicateTransfer(
  { studentIds, counterpartyId, amount, reason = 'transfer' },
  transaction,
) {
  const recent = await CoinTransaction.findOne({
    where: {
      studentId: studentIds,
      counterpartyId,
      amount,
      reason,
      createdAt: { [Op.gte]: new Date(Date.now() - DUPLICATE_TRANSFER_WINDOW_MS) },
    },
    transaction,
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
