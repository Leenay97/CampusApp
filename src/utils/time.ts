// Время из тех. данных ("HH:mm[:ss]") уже прошло сегодня
export function isTimePassed(time?: string | null): boolean {
  if (!time) return false;

  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours)) return false;

  const moment = new Date();
  moment.setHours(hours, minutes || 0, 0, 0);

  return new Date() >= moment;
}
