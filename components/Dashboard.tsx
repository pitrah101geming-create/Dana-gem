
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAccount, TransactionType } from '../types';
import { translations } from '../translations';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ account, updateAccount }) => {
  const navigate = useNavigate();
  const lang = account.language || 'id';
  const t = translations[lang].dashboard;
  
  // VIP Reward Logic
  useEffect(() => {
    if (account.vip?.isActive) {
      const now = new Date();
      const expiry = new Date(account.vip.expiryDate);
      
      // 1. Check if VIP has expired
      if (now > expiry) {
        updateAccount(prev => ({
          ...prev,
          vip: { ...prev.vip!, isActive: false }
        }));
        return;
      }

      // 2. Daily Claim Check
      const todayStr = now.toISOString().split('T')[0];
      const lastClaimStr = account.vip.lastClaimDate;

      if (todayStr !== lastClaimStr) {
        // Award 10M daily
        updateAccount(prev => ({
          ...prev,
          balance: prev.balance + 10000000,
          vip: {
            ...prev.vip!,
            lastClaimDate: todayStr
          },
          transactions: [
            ...prev.transactions,
            {
              id: 'vip-reward-' + Date.now(),
              type: TransactionType.INCOME,
              category: 'VIP Reward',
              amount: 10000000,
              description: t.vipClaimed,
              date: todayStr,
              status: 'COMPLETED'
            }
          ]
        }));
      }
    }
  }, [account.vip, updateAccount]);

  const chartData = account.transactions.filter(t => t.status !== 'PENDING').slice(-7).map(t => ({
    name: new Date(t.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }),
    amount: t.type === TransactionType.EXPENSE ? -t.amount : t.amount
  }));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className={`${account.vip?.isActive ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-blue-600'} pt-8 pb-16 px-6 rounded-b-[40px] text-white shadow-lg transition-colors duration-1000`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className={`w-10 h-10 ${account.vip?.isActive ? 'bg-white/30' : 'bg-white/20'} rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/30 overflow-hidden`}>
              {account.profileImage ? (
                <img src={account.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <i className="fa-solid fa-user"></i>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`${account.vip?.isActive ? 'text-amber-100' : 'text-blue-100'} text-xs`}>{t.halo},</p>
                {account.vip?.isActive && (
                  <span className="bg-white/20 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                    <i className="fa-solid fa-crown text-[8px]"></i>
                    VIP
                  </span>
                )}
              </div>
              <h1 className="text-sm font-bold">{account.name}</h1>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md cursor-pointer">
            <i className="fa-solid fa-bell"></i>
          </div>
        </div>
        
        <div className="mt-4">
          <p className={`${account.vip?.isActive ? 'text-amber-100' : 'text-blue-100'} text-sm opacity-80`}>{t.balance}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light">Rp</span>
            <span className="text-4xl font-bold tracking-tight">
              {account.balance.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}
            </span>
          </div>
          {account.vip?.isActive && (
            <div className="mt-3 inline-flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              <i className="fa-solid fa-gem text-xs text-amber-200 animate-pulse"></i>
              <span className="text-[10px] font-black tracking-widest uppercase">{t.vipActive}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-md p-4 flex justify-between items-center">
          <div onClick={() => navigate('/topup')} className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`w-12 h-12 ${account.vip?.isActive ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center text-xl`}>
              <i className="fa-solid fa-plus"></i>
            </div>
            <span className="text-xs font-medium text-gray-600">{t.topup}</span>
          </div>
          <div onClick={() => navigate('/scan')} className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`w-12 h-12 ${account.vip?.isActive ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center text-xl`}>
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <span className="text-xs font-medium text-gray-600">{t.scan}</span>
          </div>
          <div onClick={() => navigate('/my-qr')} className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`w-12 h-12 ${account.vip?.isActive ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center text-xl`}>
              <i className="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <span className="text-xs font-medium text-gray-600">{t.request}</span>
          </div>
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className={`w-12 h-12 ${account.vip?.isActive ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center text-xl`}>
              <i className="fa-solid fa-ellipsis"></i>
            </div>
            <span className="text-xs font-medium text-gray-600">{t.more}</span>
          </div>
        </div>
      </div>

      {/* Spending Insight */}
      <div className="mt-8 px-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t.chart}</h2>
        <div className="bg-white p-4 rounded-2xl shadow-sm h-48">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={account.vip?.isActive ? "#f59e0b" : "#3b82f6"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={account.vip?.isActive ? "#f59e0b" : "#3b82f6"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                formatter={(value: number) => `Rp ${value.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="amount" stroke={account.vip?.isActive ? "#f59e0b" : "#3b82f6"} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 px-6 pb-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">{t.history}</h2>
          <button className="text-blue-600 text-sm font-medium">{t.seeAll}</button>
        </div>
        <div className="space-y-3">
          {account.transactions.slice().reverse().map(transaction => (
            <div key={transaction.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.category === 'VIP Reward' 
                    ? 'bg-amber-100 text-amber-600' 
                    : (transaction.type === TransactionType.INCOME 
                        ? (transaction.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600') 
                        : 'bg-red-50 text-red-600')
                }`}>
                  <i className={`fa-solid ${
                    transaction.category === 'VIP Reward' 
                      ? 'fa-crown' 
                      : (transaction.type === TransactionType.INCOME ? 'fa-arrow-down' : 'fa-arrow-up')
                  }`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">{transaction.description}</h3>
                    {transaction.status === 'PENDING' && (
                      <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{transaction.category} • {new Date(transaction.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
                </div>
              </div>
              <div className={`text-sm font-bold ${
                transaction.status === 'PENDING' 
                  ? 'text-amber-500' 
                  : (transaction.type === TransactionType.INCOME || transaction.category === 'VIP Reward' ? 'text-green-600' : 'text-gray-800')
              }`}>
                {(transaction.type === TransactionType.INCOME || transaction.category === 'VIP Reward') ? '+' : '-'} Rp{transaction.amount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
