import NotificationBell from './NotificationBell';
import SyncStatusIndicator from '../shared/SyncStatusIndicator';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center">
      <div className="flex items-center justify-between px-4 w-full">
        <h1 className="text-xl font-bold text-gray-900">DocuTrack</h1>
        <div className="flex items-center gap-3">
          <SyncStatusIndicator compact />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
