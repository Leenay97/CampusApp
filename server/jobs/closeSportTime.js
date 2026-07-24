import { Op } from 'sequelize';
import { Workshop } from '../models/index.js';

function msUntilNextClose() {
  const now = new Date();
  const nextClose = new Date(now);
  nextClose.setHours(13, 0, 0, 0);
  if (nextClose <= now) {
    nextClose.setDate(nextClose.getDate() + 1);
  }
  return nextClose.getTime() - now.getTime();
}

async function closeSportTime() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [count] = await Workshop.update(
      { isClosed: true },
      {
        where: {
          type: 'SPORT',
          isClosed: false,
          date: { [Op.between]: [startOfDay, endOfDay] },
        },
      },
    );
    console.log(`✅ Sport Time автоматически закрыт (${count})`);
  } catch (error) {
    console.error('❌ Ошибка автозакрытия Sport Time:', error);
  }
}

export function scheduleSportTimeClose() {
  const delay = msUntilNextClose();
  console.log(`⏰ Автозакрытие Sport Time запланировано через ${Math.round(delay / 60000)} мин`);

  setTimeout(async () => {
    await closeSportTime();
    scheduleSportTimeClose();
  }, delay);
}
