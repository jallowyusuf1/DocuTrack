import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ChildManage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4" style={{
      background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Child Management</h1>
        <p className="text-white/70">Child management feature is not yet implemented.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-800 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}




