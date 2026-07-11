type MenuOption = {
  name: string;
  link: string;
};

type MenuGroup = {
  title: string;
  options: MenuOption[];
};

export const AdminPanelGroups: MenuGroup[] = [
  {
    title: 'Группы',
    options: [
      { name: 'Points', link: '/admin/panel/points' },
      { name: 'Резиночки', link: '/admin/panel/rubbers' },
    ],
  },
  {
    title: 'День',
    options: [
      { name: 'Распорядок дня', link: '/admin/panel/schedule' },
      { name: 'Мастерклассы', link: '/admin/panel/workshops' },
      { name: 'Sport Time', link: '/admin/panel/sporttime' },
    ],
  },
  {
    title: 'Прочее',
    options: [
      { name: 'Управление домиками', link: '/admin/panel/houses' },
      { name: 'Тех. данные', link: '/admin/panel/technical-data' },
      { name: 'Голосования', link: '/admin/panel/election' },
      { name: 'Пуш-уведомления', link: '/admin/panel/push' },
    ],
  },
  {
    title: 'Сезон',
    options: [
      { name: 'Управление сезонами', link: '/admin/panel/season-management' },
      { name: 'Учителя', link: '/admin/panel/teachers' },
      { name: 'Архив сезонов', link: '/admin/panel/season-archive' },
      { name: 'Языковые группы', link: '/admin/panel/classes' },
      { name: 'Места', link: '/admin/panel/places' },
      { name: 'Cтуденты', link: '/admin/panel/students' },
    ],
  },
  {
    title: 'Общее',
    options: [
      { name: 'Учителя', link: '/admin/panel/teachers' },
      { name: 'Cтуденты', link: '/admin/panel/students' },
    ],
  },
];
