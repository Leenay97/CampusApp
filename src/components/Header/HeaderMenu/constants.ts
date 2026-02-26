type MenuOption = {
  name: string;
  link: string;
};

export const HeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Моя группа', link: '/group' },
  { name: 'iPod', link: '/ipod' },
  { name: 'Новости', link: '/news' },
  { name: 'Расписание', link: '/schedule' },
];
