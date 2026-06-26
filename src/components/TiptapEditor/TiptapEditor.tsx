'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './TiptapEditor.module.scss';

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Placeholder.configure({
        placeholder: 'Введите текст...',
      }),
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
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
