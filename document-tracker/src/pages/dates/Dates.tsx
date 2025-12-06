import { Plus } from 'lucide-react';

export default function Dates() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Important Dates</h2>
          <p className="text-sm text-gray-600">Track important dates and deadlines</p>
        </div>
        <button className="btn bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Dates List */}
      <div className="space-y-3">
        <div className="card">
          <p className="text-sm text-gray-600 text-center py-8">
            No important dates yet. Add your first date to get started.
          </p>
        </div>
      </div>
    </div>
  );
}

