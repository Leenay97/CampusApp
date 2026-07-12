'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminPanelGroups } from './constants';
import styles from './Panel.module.scss';

export default function PanelMenu() {
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <div className={styles['admin-panel']}>
      {AdminPanelGroups.map((group) => {
        const isOpen = openGroups.includes(group.title);
        return (
          <div key={group.title} className={styles['admin-panel__group']}>
            <button
              type="button"
              className={`${styles['admin-panel__group-title']} ${isOpen ? styles['admin-panel__group-title--open'] : ''}`}
              onClick={() => toggleGroup(group.title)}
            >
              {group.title}
            </button>
            <div
              className={`${styles['admin-panel__group-body']} ${isOpen ? styles['admin-panel__group-body--open'] : ''}`}
            >
              <div className={styles['admin-panel__group-options']}>
                {group.options.map((item) => (
                  <Link key={item.link} href={item.link} className={styles['admin-panel__option']}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
