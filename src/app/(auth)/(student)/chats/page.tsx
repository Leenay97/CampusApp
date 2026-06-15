'use client';

import styles from './Chat.module.scss';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function GroupChat() {
  const [message, setMessage] = useState('');
  return (
    <div className={styles['chat']}>
      <div className={styles['chat__container']}>
        <div className={`${styles['message']} ${styles['message_incoming']}`}>
          <div className={styles['message__avatar']}></div>
          <div className={styles['message__popup']}>
            <div className={styles['message__name']}>Akito</div>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_my']}`}>
          <div className={styles['message__popup']}>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_incoming']}`}>
          <div className={styles['message__avatar']}></div>
          <div className={styles['message__popup']}>
            <div className={styles['message__name']}>Akito</div>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_my']}`}>
          <div className={styles['message__popup']}>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_incoming']}`}>
          <div className={styles['message__avatar']}></div>
          <div className={styles['message__popup']}>
            <div className={styles['message__name']}>Akito</div>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_my']}`}>
          <div className={styles['message__popup']}>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_incoming']}`}>
          <div className={styles['message__avatar']}></div>
          <div className={styles['message__popup']}>
            <div className={styles['message__name']}>Akito</div>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={`${styles['message']} ${styles['message_my']}`}>
          <div className={styles['message__popup']}>
            <div className={styles['message__text']}>
              text text text text text text text text text text text text text text text text text
              text text text text
            </div>
          </div>
        </div>

        <div className={styles['message__my']}></div>
      </div>
      <div className={styles['chat__input-field']}>
        <TextareaAutosize
          className={styles['chat__input']}
          placeholder="Сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className={styles['chat__send-button']} />
      </div>
    </div>
  );
}
