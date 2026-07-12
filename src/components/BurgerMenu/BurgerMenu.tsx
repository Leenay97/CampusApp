import { JSX, memo, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { getHeaderMenuSections } from './constants';
import styles from './BurgerMenu.module.scss';
import Link from 'next/link';
import { UserLevel } from '@/app/types';
import GroupChatIcon from '../Icons/GroupChatIcon/GroupChatIcon';
import StaffChatIcon from '../Icons/StaffChatIcon/StaffChatIcon';

type BurgerMenuProps = {
  isOpen: boolean;
  userLevel?: UserLevel;
  onClose: () => void;
};

function BurgerMenu({ isOpen, userLevel, onClose }: BurgerMenuProps): JSX.Element {
  const { data: technicalData } = useQuery(queries.GET_TECHICAL_DATA);
  const isElectionShown = technicalData?.technicalData?.isElectionShown ?? false;

  const sections = getHeaderMenuSections(userLevel ?? UserLevel.Student).map((section) => ({
    ...section,
    options: isElectionShown
      ? section.options
      : section.options.filter((option) => option.link !== '/election'),
  }));
  const [openTitle, setOpenTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setOpenTitle(null);
    }
  }, [isOpen]);

  function handleSectionToggle(title: string) {
    setOpenTitle((prev) => (prev === title ? null : title));
  }

  return (
    <div className={isOpen ? styles['burger-menu'] : styles['burger-menu--hidden']}>
      <nav className={styles['burger-menu__wrapper']}>
        {sections.map((section, index) => {
          const isCollapsible = Boolean(section.title);
          const isSectionOpen = isCollapsible ? openTitle === section.title : true;

          return (
            <div key={section.title ?? index} className={styles['burger-menu__section']}>
              {section.title && (
                <button
                  type="button"
                  className={`${styles['burger-menu__section-title']} ${
                    isSectionOpen ? styles['burger-menu__section-title--open'] : ''
                  }`}
                  onClick={() => handleSectionToggle(section.title as string)}
                  aria-expanded={isSectionOpen}
                >
                  {section.title}
                  <span
                    className={`${styles['burger-menu__section-arrow']} ${
                      isSectionOpen ? styles['burger-menu__section-arrow--open'] : ''
                    }`}
                  />
                </button>
              )}
              <div
                className={`${styles['burger-menu__section-content']} ${
                  isSectionOpen ? styles['burger-menu__section-content--open'] : ''
                }`}
              >
                {section.options.map((option) => (
                  <Link
                    key={option.link}
                    href={option.link}
                    className={styles['burger-menu__option']}
                    onClick={onClose}
                  >
                    {option.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        <div className={styles['burger-menu__chat']}>
          {userLevel !== UserLevel.Student && (
            <Link href="/staff-chat" className={styles['burger-menu__chat-btn']} onClick={onClose}>
              <StaffChatIcon />
              <div className="">Staff chat</div>
            </Link>
          )}
          {userLevel !== UserLevel.Admin && (
            <Link href="/chat" className={styles['burger-menu__chat-btn']} onClick={onClose}>
              <GroupChatIcon />
              <div className="">Чат группы</div>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default memo(BurgerMenu);
