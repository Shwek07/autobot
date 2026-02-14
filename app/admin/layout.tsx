import Dashboard from '@/components/dashboard/Dashboard';
import Sidebar from '@/components/dashboard/Sidebar';

export default function layout() {
  return (
   
<div className="layout">
  {/* <Sidebar /> */}
  <main className="main">
     <Dashboard />
    <div className='content'>
   
    </div>
  </main>
</div>
  );
}
