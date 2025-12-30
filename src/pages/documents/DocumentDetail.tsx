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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ComprehensiveDocumentDetail />
    </Suspense>
  );
}
