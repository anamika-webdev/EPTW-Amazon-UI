import { useState } from 'react';
import { Check } from 'lucide-react';

const ppeItems = [
  { id: 'helmet', label: 'Safety Helmet', icon: '⛑️' },
  { id: 'vest', label: 'Safety Vest', icon: '🦺' },
  { id: 'gloves', label: 'Safety Gloves', icon: '🧤' },
  { id: 'boots', label: 'Safety Boots', icon: '🥾' },
  { id: 'glasses', label: 'Safety Glasses', icon: '🥽' },
  { id: 'mask', label: 'Face Mask', icon: '😷' },
  { id: 'earplugs', label: 'Ear Protection', icon: '🎧' },
  { id: 'harness', label: 'Safety Harness', icon: '🪢' },
];

interface PPESelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PPESelector({ selected, onChange }: PPESelectorProps) {
  const togglePPE = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {ppeItems.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => togglePPE(item.id)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="text-3xl md:text-4xl mb-2">{item.icon}</div>
            <p className="text-xs text-slate-700">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}