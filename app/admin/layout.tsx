import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/dashboard/Sidebar';

export default function layout() {
  return (
   
<div className="layout">
  <Sidebar />
  <main className="main">
    <div className='content'>
    <Dashboard />
    </div>
  </main>
</div>
  );
}
