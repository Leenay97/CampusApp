import { User } from '../models/index.js';

const DEFAULT_LIVES = 3;

function msUntilNextReset() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(3, 15, 0, 0);
  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }
  return nextReset.getTime() - now.getTime();
}

async function resetLives() {
  try {
    const [count] = await User.update(
      { lives: DEFAULT_LIVES },
      { where: { userLevel: 'STUDENT' } },
    );
    console.log(`✅ Жизни сброшены до ${DEFAULT_LIVES} у ${count} студентов`);
  } catch (error) {
    console.error('❌ Ошибка сброса жизней:', error);
  }
}

export function scheduleLivesReset() {
  const delay = msUntilNextReset();
  console.log(`⏰ Сброс жизней запланирован через ${Math.round(delay / 60000)} мин`);

  setTimeout(async () => {
    await resetLives();
    scheduleLivesReset();
  }, delay);
}
