import { UserLevel } from '@/app/types';

type MenuOption = {
  name: string;
  link: string;
};

export const StudentHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Расписание', link: '/schedule' },
  { name: 'iPod', link: '/ipod' },
];

export const TeacherHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Мой мастеркласс', link: 'teacher/my-workshop' },
  { name: 'Моя группа', link: 'teacher/my-group' },
  { name: 'Расписание', link: '/schedule' },
  { name: 'iPod', link: '/ipod' },
  { name: '[Редактировать группу]', link: '/teacher/group' },
  { name: '[QR группы]', link: '/teacher/group/qr' },
];

export const AdminHeaderMenuOptions: MenuOption[] = [
  { name: 'Главная', link: '/' },
  { name: 'Мастерклассы', link: '/workshops' },
  { name: 'Расписание', link: '/schedule' },
  { name: '[Сезоны]', link: '/admin/seasons' },
  { name: '[Учителя]', link: '/admin/teachers' },
  { name: '[Points]', link: '/admin/points' },
  { name: '[Места]', link: '/admin/places' },
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
