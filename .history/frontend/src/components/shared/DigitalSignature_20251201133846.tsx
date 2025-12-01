// frontend/src/components/shared/DigitalSignature.tsx
import { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, RotateCcw, Check } from 'lucide-react';

interface DigitalSignatureProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;  // Made optional for backwards compatibility
  onClose?: () => void;   // Made optional for backwards compatibility
  title?: string;
  existingSignature?: string;
}

export function DigitalSignature({ 
  onSave, 
  onCancel,
  onClose, 
  title = 'Digital Signature',
  existingSignature 
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Handle both onCancel and onClose for backwards compatibility
  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 300;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing signature if provided
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = existingSignature;
    }

    // Drawing settings
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch support for tablets/mobile
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      alert('Please provide your signature before saving');
      return;
    }

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-700"
            type="button"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Instructions */}
        <p className="mb-4 text-sm text-slate-600">
          Please sign in the box below using your mouse or touchscreen.
        </p>

        {/* Canvas */}
        <div className="mb-4 border-2 border-dashed rounded-lg border-slate-300">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawingTouch}
            onTouchMove={drawTouch}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3">
          <Button
            onClick={handleClear}
            variant="outline"
            className="gap-2"
            disabled={!hasDrawn}
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>

          <div className="flex gap-3">
            <Button 
              onClick={handleClose} 
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={!hasDrawn}
              type="button"
            >
              <Check className="w-4 h-4" />
              Save Signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}