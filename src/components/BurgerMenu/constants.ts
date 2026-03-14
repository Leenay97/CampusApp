import { UserLevel } from '@/app/types';

type MenuOption = {
  name: string;
  link: string;
};

export const StudentHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Sport Time', link: '/sporttime' },
  { name: 'Расписание', link: '/schedule' },
  { name: 'iPod', link: '/ipod' },
];

export const TeacherHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Sport Time', link: '/sporttime' },
  { name: 'Мой мастеркласс', link: '/teacher/my-workshop' },
  { name: 'Моя группа', link: '/teacher/my-group' },
  { name: 'Расписание', link: '/schedule' },
  { name: 'iPod', link: '/ipod' },
  { name: '[Редактировать группу]', link: '/teacher/group' },
  { name: '[QR группы]', link: '/teacher/group/qr' },
];

export const AdminHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Расписание', link: '/schedule' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Sport Time', link: '/sporttime' },
  { name: '[Сезоны]', link: '/admin/seasons' },
  { name: '[Учителя]', link: '/admin/teachers' },
  { name: '[Points]', link: '/admin/points' },
  { name: '[Места]', link: '/admin/places' },
  { name: '[Мастерклассы]', link: '/admin/workshops' },
  { name: '[Sport Time]', link: '/admin/sporttime' },
  { name: '[Распорядок дня]', link: '/admin/schedule' },
];

export function getHeaderMenuOptions(userLevel: UserLevel) {
  switch (userLevel) {
    case UserLevel.Student:
      return StudentHeaderMenuOptions;
    case UserLevel.Teacher:
      return TeacherHeaderMenuOptions;
    case UserLevel.Admin:
      return AdminHeaderMenuOptions;
  }
}
