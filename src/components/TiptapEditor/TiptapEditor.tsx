'use client';

import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { UPLOAD_POST_IMAGE } from '@/graphql/mutations/UploadPostImage';
import styles from './TiptapEditor.module.scss';

// Ширина хранится в inline-стиле в процентах, чтобы пережить санитайзер
// при показе поста и масштабироваться под ширину ленты
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.style.width || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}` };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      let currentNode = node;

      const wrapper = document.createElement('span');
      wrapper.className = styles['image-resizer'];

      const img = document.createElement('img');
      img.src = node.attrs.src;
      if (node.attrs.width) img.style.width = node.attrs.width;

      const handle = document.createElement('span');
      handle.className = styles['resize-handle'];

      wrapper.append(img, handle);

      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        handle.setPointerCapture(event.pointerId);

        const startX = event.clientX;
        const startWidth = img.getBoundingClientRect().width;

        function onMove(moveEvent: PointerEvent) {
          const width = Math.max(50, startWidth + moveEvent.clientX - startX);
          img.style.width = `${width}px`;
        }

        function onUp() {
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onUp);

          const containerWidth = wrapper.parentElement?.getBoundingClientRect().width;
          if (!containerWidth) return;

          const percent = Math.min(
            100,
            Math.max(10, Math.round((img.getBoundingClientRect().width / containerWidth) * 100)),
          );

          const pos = typeof getPos === 'function' ? getPos() : undefined;
          if (pos === undefined) return;
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...currentNode.attrs,
              width: `${percent}%`,
            }),
          );
        }

        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
      });

      return {
        dom: wrapper,

        update(updatedNode) {
          if (updatedNode.type.name !== 'image') return false;
          currentNode = updatedNode;
          img.src = updatedNode.attrs.src;
          img.style.width = updatedNode.attrs.width || '';
          return true;
        },

        // Иначе ProseMirror перехватывает перетаскивание ручки как drag&drop ноды
        stopEvent(event) {
          return event.target === handle;
        },
      };
    };
  },
});

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (url: string) => void;
};

export default function TiptapEditor({ value, onChange, onImageUpload }: TiptapEditorProps) {
  const [uploadPostImage] = useGlobalLoadingMutation<{ uploadPostImage: string }>(
    UPLOAD_POST_IMAGE,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // Без этого тулбар не обновляется и подсветка кнопок B/I не работает
    shouldRerenderOnTransaction: true,

    extensions: [
      StarterKit,

      Placeholder.configure({
        placeholder: 'Введите текст...',
      }),

      ResizableImage,
    ],

    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();

    if (current !== value) {
      editor.commands.setContent(value, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  async function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Файл не должен превышать 50MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Поддерживаются только JPEG, PNG и WEBP');
      return;
    }

    try {
      const data = await uploadPostImage({ file });
      onImageUpload?.(data.uploadPostImage);
      editor
        .chain()
        .focus()
        .setImage({ src: `${process.env.NEXT_PUBLIC_API_URL}${data.uploadPostImage}` })
        .run();
    } catch (error) {
      console.error('Ошибка загрузки картинки:', error);
    }
  }

  if (!editor) return null;

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={editor.isActive('bold') ? styles.active : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <b>B</b>
        </button>

        <button
          type="button"
          className={editor.isActive('italic') ? styles.active : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i>I</i>
        </button>

        <button type="button" onClick={() => fileInputRef.current?.click()}>
          🖼️
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          hidden
        />
      </div>

      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
}
