const ACTIVITY_ICONS: [RegExp, string][] = [
  [/breakfast|завтрак/i, '🍳'],
  [/lunch|обед/i, '🍝'],
  [/dinner|ужин/i, '🍽️'],
  [/snack|перекус/i, '🍎'],
  [/sport/i, '🏐'],
  [/workshop|мастер/i, '🎨'],
  [/powernap|тихий час/i, '💤'],
  [/sleep|сон|отбой/i, '😴'],
  [/team/i, '🤝'],
  [/chat/i, '💬'],
  [/show|шоу/i, '🎤'],
  [/ipod|battle|батл/i, '🎧'],
  [/game|игра/i, '🎲'],
];

export function getActivityIcon(activity: string): string {
  const match = ACTIVITY_ICONS.find(([pattern]) => pattern.test(activity ?? ''));
  return match ? match[1] : '📍';
}

// Выбор иконки при составлении расписания; пустая строка = автоподбор по названию
export const EMOJI_CHOICES = [
  '🍳',
  '🍝',
  '🍽️',
  '🍎',
  '🏐',
  '⚽',
  '🏀',
  '🏊',
  '🎨',
  '🤝',
  '💬',
  '🎤',
  '🎧',
  '🎲',
  '🎬',
  '🎭',
  '🎸',
  '🎉',
  '📚',
  '🧩',
  '🧘',
  '🏖️',
  '🚌',
  '🔥',
  '💤',
  '😴',
  '📍',
  '❗',
  '🔥',
];

export const DEFAULT_SCHEDULE = {
  name: 'DAY 1....',
  schedule: [
    {
      time: '09:00',
      activity: 'Breakfast',
    },
    {
      time: '09:30',
      activity: 'Team Time',
    },
    {
      time: '10:15',
      activity: 'Chat Room',
    },
    {
      time: '11:30',
      activity: 'Sport Time',
    },
    {
      time: '13:30',
      activity: 'Lunch',
    },
    {
      time: '14:00',
      activity: 'Powernapping',
    },
    {
      time: '15:00',
      activity: 'Workshops',
    },
    {
      time: '16:15',
      activity: 'Snack',
    },
    {
      time: '16:40',
      activity: 'Big Game',
    },
    {
      time: '18:30',
      activity: 'Dinner',
    },
    {
      time: '19:30',
      activity: 'Evening Show Preparation',
    },
    {
      time: '21:15',
      activity: 'Snack',
    },
    {
      time: '21:30',
      activity: 'iPod Battle',
    },
    {
      time: '23:00',
      activity: 'Go To Sleep',
    },
  ],
};
