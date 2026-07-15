import styles from './ChatInput.module.scss';
import TextareaAutosize from 'react-textarea-autosize';
import { useState } from 'react';
import StickerPicker from '../StickerPicker/StickerPicker';

type ChatInputProps = {
  message: string;
  onChangeMessage: (value: string) => void;
  onSend: () => void;
  onSendSticker: (stickerUrl: string) => void;
};

export default function ChatInput({
  message,
  onChangeMessage,
  onSend,
  onSendSticker,
}: ChatInputProps) {
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChangeMessage(e.target.value);
  }

  function handleSelectSticker(stickerUrl: string) {
    setIsStickerPickerOpen(false);
    onSendSticker(stickerUrl);
  }

  return (
    <div className={styles['chat-input']}>
      {isStickerPickerOpen && (
        <StickerPicker
          onSelect={handleSelectSticker}
          onClose={() => setIsStickerPickerOpen(false)}
        />
      )}
      <div className={styles['chat-input__field']}>
        <TextareaAutosize
          className={styles['chat-input__input']}
          placeholder="Сообщение"
          value={message}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          type="button"
          className={styles['chat-input__sticker-button']}
          onClick={() => setIsStickerPickerOpen((open) => !open)}
          aria-label="Стикеры"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>
      </div>
      <button
        className={styles['chat-input__send-button']}
        onClick={onSend}
        disabled={!message.trim()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
