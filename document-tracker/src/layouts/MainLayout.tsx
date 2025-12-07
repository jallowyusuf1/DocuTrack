import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import FABContainer from '../components/layout/FABContainer';

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <main className="flex-1 overflow-y-auto pb-[72px]">
        <Outlet />
      </main>
      <BottomNav />
      <FABContainer />
    </div>
  );
}

