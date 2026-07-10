import { UserLevel } from '@/app/types';

type MenuOption = {
  name: string;
  link: string;
};

type MenuSection = {
  title?: string;
  options: MenuOption[];
};

const NavigationSection: MenuSection = {
  options: [
    { name: 'Главная', link: '/' },
    { name: 'Расписание', link: '/schedule' },
    { name: 'Лента', link: '/information' },
    { name: 'Домики', link: '/houses' },
    { name: 'Резиночки', link: '/rubbers' },
    { name: 'Голосование', link: '/election' },
  ],
};

const StudentActivitiesSection: MenuSection = {
  title: 'Активности',
  options: [
    { name: 'Мастерклассы', link: '/workshops' },
    { name: 'Sport Time', link: '/sporttime' },
  ],
};

const AdminActivitiesSection: MenuSection = {
  title: 'Активности',
  options: [
    { name: 'Мастерклассы', link: '/workshops' },
    { name: 'Sport Time', link: '/sporttime' },
  ],
};

const TeacherSection: MenuSection = {
  title: "Teachers' stuff",
  options: [
    { name: 'Мой мастеркласс', link: '/teacher/my-workshop' },
    { name: 'Lessons', link: '/teacher/lessons' },
    { name: 'My team', link: '/teacher/group' },
    { name: 'QR группы', link: '/teacher/group/qr' },
    { name: 'Восстановление пароля', link: '/teacher/password-reset' },
  ],
};

const AdminSection: MenuSection = {
  options: [{ name: 'Панель администратора', link: '/admin/panel' }],
};

export const StudentHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  StudentActivitiesSection,
];

export const TeacherHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  StudentActivitiesSection,
  TeacherSection,
];

export const AdminHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  AdminActivitiesSection,
  AdminSection,
];

export function getHeaderMenuSections(userLevel: UserLevel): MenuSection[] {
  switch (userLevel) {
    case UserLevel.Teacher:
      return TeacherHeaderMenuSections;
    case UserLevel.Admin:
      return AdminHeaderMenuSections;
    case UserLevel.Student:
    default:
      return StudentHeaderMenuSections;
  }
}
