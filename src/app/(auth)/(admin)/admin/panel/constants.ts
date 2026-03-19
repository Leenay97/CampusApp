type MenuOption = {
  name: string;
  link: string;
};

export const AdminPanelOptions: MenuOption[] = [
  { name: 'Управление сезонами', link: '/admin/panel/seasons' },
  { name: 'Учителя', link: '/admin/panel/teachers' },
  { name: 'Points', link: '/admin/panel/points' },
  { name: 'Места', link: '/admin/panel/places' },
  { name: 'Мастерклассы', link: '/admin/panel/workshops' },
  { name: 'Sport Time', link: '/admin/panel/sporttime' },
  { name: 'Распорядок дня', link: '/admin/panel/schedule' },
  { name: 'Тех. данные', link: '/admin/panel/technical-data' },
  { name: 'Управление домиками', link: '/houses' },
];
