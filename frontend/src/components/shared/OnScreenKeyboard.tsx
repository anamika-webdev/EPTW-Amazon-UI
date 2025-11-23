import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface OnScreenKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  title?: string;
}

export function OnScreenKeyboard({ onKeyPress, onClose, title = 'On-Screen Keyboard' }: OnScreenKeyboardProps) {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  const specialKeys = [
    { label: 'Space', value: ' ' },
    { label: 'Backspace', value: 'Backspace' },
    { label: '.', value: '.' },
    { label: ',', value: ',' },
    { label: '-', value: '-' },
  ];

  const handleKeyPress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
      <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard */}
        <div className="p-6 space-y-3">
          {/* Number Row */}
          <div className="flex gap-2 justify-center">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-slate-900 transition-colors"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Letter Rows */}
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="w-12 h-12 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg text-slate-900 transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}

          {/* Special Keys */}
          <div className="flex gap-2 justify-center">
            {specialKeys.map((key) => (
              <button
                key={key.label}
                onClick={() => handleKeyPress(key.value)}
                className={`h-12 px-6 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-lg text-blue-900 transition-colors ${
                  key.label === 'Space' ? 'flex-1 max-w-md' : ''
                }`}
              >
                {key.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
