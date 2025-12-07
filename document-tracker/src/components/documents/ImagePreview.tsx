import { RotateCcw, Check } from 'lucide-react';
import Button from '../ui/Button';

interface ImagePreviewProps {
  imageUrl: string;
  onRetake: () => void;
  onContinue: () => void;
}

export default function ImagePreview({ imageUrl, onRetake, onContinue }: ImagePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Image Preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt="Document preview"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-900 px-4 py-6 space-y-3 safe-area-bottom">
        <Button
          variant="secondary"
          fullWidth
          onClick={onRetake}
          className="bg-gray-800 text-white border-gray-700"
        >
          <RotateCcw className="w-5 h-5 mr-2 inline" />
          Choose Different
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          <Check className="w-5 h-5 mr-2 inline" />
          Continue
        </Button>
      </div>
    </div>
  );
}

