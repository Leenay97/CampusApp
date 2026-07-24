import { UserLevel } from '@/app/types';

type MenuOption = {
  name: string;
  link: string;
};

type MenuSection = {
  title?: string;
  options: MenuOption[];
};

export const DefaultOpenSectionTitle = 'Главное';

const NavigationSection: MenuSection = {
  title: DefaultOpenSectionTitle,
  options: [
    { name: 'Рейтинг', link: '/' },
    { name: 'Расписание', link: '/schedule' },
    { name: 'Лента', link: '/information' },
    { name: 'Домики', link: '/houses' },
    { name: 'Резиночки', link: '/rubbers' },
  ],
};

const StudentActivitiesSection: MenuSection = {
  title: 'Активности',
  options: [
    { name: 'Мастерклассы', link: '/workshops' },
    { name: 'Sport Time', link: '/sporttime' },
    { name: 'iPod Battle', link: '/ipod' },
  ],
};

const AdminActivitiesSection: MenuSection = {
  title: 'Активности',
  options: [
    { name: 'Мастерклассы', link: '/workshops' },
    { name: 'Sport Time', link: '/sporttime' },
    { name: 'iPod Battle', link: '/ipod' },
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
    { name: 'Пушки', link: '/teacher/push' },
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
