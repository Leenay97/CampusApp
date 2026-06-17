import styles from './ChatInput.module.scss';
import TextareaAutosize from 'react-textarea-autosize';

type ChatInputProps = {
  message: string;
  onChangeMessage: (value: string) => void;
  onSend: () => void;
};

export default function ChatInput({ message, onChangeMessage, onSend }: ChatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeMessage(e.target.value);
  };

  return (
    <div className={styles['chat-input']}>
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
