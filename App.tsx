
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Savings from './components/Savings';
import Transfer from './components/Transfer';
import Advisor from './components/Advisor';
import Scanner from './components/Scanner';
import Login from './components/Login';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import MyQR from './components/MyQR';
import TopUp from './components/TopUp';
import { UserAccount, TransactionType } from './types';
import { translations } from './translations';

const INITIAL_DATA: UserAccount = {
  name: "Budi Santoso",
  phone: "",
  balance: 0,
  profileImage: "",
  language: 'id',
  transactions: [
    { id: '1', type: TransactionType.INCOME, category: 'Gaji', amount: 5000000, description: 'Gaji Bulanan', date: '2023-10-01', status: 'COMPLETED' },
    { id: '2', type: TransactionType.EXPENSE, category: 'Makanan', amount: 50000, description: 'Makan Siang Nasi Padang', date: '2023-10-02', status: 'COMPLETED' },
    { id: '3', type: TransactionType.EXPENSE, category: 'Transport', amount: 15000, description: 'Ojek Online', date: '2023-10-02', status: 'COMPLETED' },
    { id: '4', type: TransactionType.EXPENSE, category: 'Belanja', amount: 200000, description: 'Supermarket Mingguan', date: '2023-10-03', status: 'COMPLETED' },
  ],
  goals: [
    { id: 'g1', name: "Liburan Bali", targetAmount: 5000000, currentAmount: 0, category: "Travel" },
    { id: 'g2', name: "iPhone Baru", targetAmount: 15000000, currentAmount: 0, category: "Gawai" }
  ],
  contacts: [
    { id: 'c1', name: 'Rina Admin', phone: '81233445566', color: 'bg-blue-500' },
    { id: 'c2', name: 'Bambang', phone: '85544332211', color: 'bg-purple-500' }
  ]
};

const Navigation = ({ language }: { language: 'id' | 'en' }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const t = translations[language].nav;
  
  const hideNavPaths = ['/scan', '/admin', '/my-qr', '/topup'];
  if (hideNavPaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 px-2 z-50">
      <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}>
        <i className="fa-solid fa-house text-xl"></i>
        <span className="text-xs mt-1">{t.home}</span>
      </Link>
      <Link to="/transfer" className={`flex flex-col items-center ${isActive('/transfer') ? 'text-blue-600' : 'text-gray-400'}`}>
        <i className="fa-solid fa-paper-plane text-xl"></i>
        <span className="text-xs mt-1">{t.send}</span>
      </Link>
      <Link to="/savings" className={`flex flex-col items-center ${isActive('/savings') ? 'text-blue-600' : 'text-gray-400'}`}>
        <i className="fa-solid fa-piggy-bank text-xl"></i>
        <span className="text-xs mt-1">{t.savings}</span>
      </Link>
      <Link to="/advisor" className={`flex flex-col items-center ${isActive('/advisor') ? 'text-blue-600' : 'text-gray-400'}`}>
        <i className="fa-solid fa-robot text-xl"></i>
        <span className="text-xs mt-1">{t.advisor}</span>
      </Link>
    </nav>
  );
};

const App: React.FC = () => {
  const [account, setAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('simpanduit_account');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!account?.phone);

  useEffect(() => {
    if (account) {
      localStorage.setItem('simpanduit_account', JSON.stringify(account));
    }
  }, [account]);

  const handleLogin = (phone: string) => {
    const newAccount = account ? { ...account, phone } : { ...INITIAL_DATA, phone };
    setAccount(newAccount);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('simpanduit_account');
    setAccount(null);
    setIsAuthenticated(false);
  };

  const updateAccount = (updater: (prev: UserAccount) => UserAccount) => {
    setAccount(prev => prev ? updater(prev) : prev);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!account) return null;

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20 shadow-xl overflow-hidden relative border-x border-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard account={account} updateAccount={updateAccount} />} />
          <Route path="/savings" element={<Savings account={account} updateAccount={updateAccount} />} />
          <Route path="/transfer" element={<Transfer account={account} updateAccount={updateAccount} />} />
          <Route path="/advisor" element={<Advisor account={account} updateAccount={updateAccount} />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/profile" element={<Profile account={account} onLogout={handleLogout} updateAccount={updateAccount} />} />
          <Route path="/admin" element={<AdminPanel account={account} updateAccount={updateAccount} />} />
          <Route path="/my-qr" element={<MyQR account={account} />} />
          <Route path="/topup" element={<TopUp account={account} updateAccount={updateAccount} />} />
        </Routes>
        <Navigation language={account.language || 'id'} />
      </div>
    </HashRouter>
  );
};

export default App;
