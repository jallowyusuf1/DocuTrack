import { Plus, Search } from 'lucide-react';

export default function Documents() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-600">Manage your documents</p>
        </div>
        <button className="btn bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <div className="card">
          <p className="text-sm text-gray-600 text-center py-8">
            No documents yet. Add your first document to get started.
          </p>
        </div>
      </div>
    </div>
  );
}

