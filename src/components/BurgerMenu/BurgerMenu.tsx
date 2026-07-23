import { JSX, memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import { DefaultOpenSectionTitle, getHeaderMenuSections } from './constants';
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

  const { data: mazeRunnerData } = useQuery(queries.GET_MAZE_RUNNER_STATUS);
  // Ивент видят студенты и учителя, админу он в меню не нужен — у него своя панель
  const isMazeRunnerShown = mazeRunnerData?.mazeRunnerStatus?.isActive ?? false;

  const sections = getHeaderMenuSections(userLevel ?? UserLevel.Student);
  const [openTitle, setOpenTitle] = useState<string | null>(DefaultOpenSectionTitle);

  useEffect(() => {
    if (!isOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setOpenTitle(DefaultOpenSectionTitle);
    }
  }, [isOpen]);

  function handleSectionToggle(title: string) {
    setOpenTitle((prev) => (prev === title ? null : title));
  }

  const chatButtons = (
    <div id="burger-menu-chat-portal" className={styles['burger-menu__chat']}>
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
  );

  return (
    <div className={isOpen ? styles['burger-menu'] : styles['burger-menu--hidden']}>
      <nav className={styles['burger-menu__wrapper']}>
        {isMazeRunnerShown && (
          <Link href="/maze-runner" className={styles['burger-menu__event']} onClick={onClose}>
            <span className={styles['burger-menu__event-dot']} />
            Maze Runner
          </Link>
        )}
        {isElectionShown && (
          <Link
            href="/election"
            className={`${styles['burger-menu__event']} ${styles['burger-menu__event--vote']}`}
            onClick={onClose}
          >
            <span className={styles['burger-menu__event-dot']} />
            Голосование
          </Link>
        )}
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
                <div className={styles['burger-menu__section-content-inner']}>
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
            </div>
          );
        })}
      </nav>
      {isOpen &&
        typeof window !== 'undefined' &&
        document.getElementById('modal-root') &&
        createPortal(chatButtons, document.getElementById('modal-root') as HTMLElement)}
    </div>
  );
}

export default memo(BurgerMenu);
