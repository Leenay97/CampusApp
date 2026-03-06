type MenuOption = {
  name: string;
  link: string;
};

export const BurgerMenuOptions: MenuOption[] = [
  { name: 'Перевести coins', link: '/' },
  { name: 'Мои мастерклассы', link: '/workshops' },
  { name: 'Выйти', link: '/login' },
];
