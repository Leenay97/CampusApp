import { useState, useRef, useEffect } from 'react';

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const colors = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
];

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: value,
          cursor: 'pointer',
          border: '1px solid #ccc',
        }}
      />

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 36,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 24px)',
            gap: 6,
            padding: 8,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {colors.map((c) => (
            <div
              key={c}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: c,
                cursor: 'pointer',
                border: value === c ? '2px solid black' : '1px solid #ddd',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
