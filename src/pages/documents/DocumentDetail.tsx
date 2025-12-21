import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import ComprehensiveDocumentDetail from './ComprehensiveDocumentDetail';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return null;
  }
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ComprehensiveDocumentDetail />
    </Suspense>
  );
}
