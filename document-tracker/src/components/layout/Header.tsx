import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">DocuTrack</h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </header>
  );
}

