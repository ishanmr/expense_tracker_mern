import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ExpenseModal from '../expenses/ExpenseModal';
import { useAuth } from '../../context/AuthContext';

const AppLayout = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return {
          title: `Welcome Back, ${user?.name ? user.name.split(' ')[0] : 'User'}!`,
          subtitle: 'Overview',
        };
      case '/expenses':
        return {
          title: 'Expense History & Management',
          subtitle: 'View, edit, and manage all your expense records to date.',
        };
      case '/categories':
        return {
          title: 'Category Breakdown',
          subtitle: 'Analyze your expenditures categorized by type.',
        };
      default:
        return {
          title: 'Personal Expense Tracker',
          subtitle: 'Manage Your Wealth Effortlessly',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="app-container">
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />
      <div className="main-wrapper">
        <Navbar title={title} subtitle={subtitle} />
        <main className="content-body">
          <Outlet context={{ openAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {isAddModalOpen && (
        <ExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            // Trigger refresh event for child pages
            window.dispatchEvent(new Event('expense-updated'));
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;
