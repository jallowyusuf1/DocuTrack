import { User, Settings, LogOut } from 'lucide-react';

export default function Profile() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      {/* User Info Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">User</h3>
            <p className="text-sm text-gray-600">user@example.com</p>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
        <button className="w-full card flex items-center justify-between hover:bg-gray-50 active:bg-gray-100">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Settings</span>
          </div>
        </button>

        <button className="w-full card flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 text-red-600">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
}

