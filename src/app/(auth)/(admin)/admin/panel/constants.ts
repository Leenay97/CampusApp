type MenuOption = {
  name: string;
  link: string;
};

export const AdminPanelOptions: MenuOption[] = [
  { name: 'Управление сезонами', link: '/admin/panel/season-management' },
  { name: 'Учителя', link: '/admin/panel/teachers' },
  { name: 'Points', link: '/admin/panel/points' },
  { name: 'Места', link: '/admin/panel/places' },
  { name: 'Мастерклассы', link: '/admin/panel/workshops' },
  { name: 'Sport Time', link: '/admin/panel/sporttime' },
  { name: 'Распорядок дня', link: '/admin/panel/schedule' },
  { name: 'Тех. данные', link: '/admin/panel/technical-data' },
  { name: 'Управление домиками', link: '/admin/panel/houses' },
  { name: 'Cтуденты', link: '/admin/panel/students' },
  { name: 'Голосования', link: '/admin/panel/election' },
];
