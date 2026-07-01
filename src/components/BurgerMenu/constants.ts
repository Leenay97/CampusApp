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
    { name: 'My team', link: '/teacher/group' },
    { name: 'QR группы', link: '/teacher/group/qr' },
  ],
};

const AdminSection: MenuSection = {
  options: [{ name: 'Панель администратора', link: '/admin/panel' }],
};

const StaffChatsSection: MenuSection = {
  title: 'Чаты',
  options: [
    { name: 'Чат группы', link: '/chat' },
    { name: 'Staff chat', link: '/staff-chat' },
  ],
};

const StudentChatSection: MenuSection = {
  options: [{ name: 'Чат группы', link: '/chat' }],
};

export const StudentHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  StudentActivitiesSection,
  StudentChatSection,
];

export const TeacherHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  StudentActivitiesSection,
  TeacherSection,
  StaffChatsSection,
];

export const AdminHeaderMenuSections: MenuSection[] = [
  NavigationSection,
  AdminActivitiesSection,
  StaffChatsSection,
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
