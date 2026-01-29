
import React, { useState } from 'react';
import { UserAccount, SavingsGoal, TransactionType } from '../types';
import { translations } from '../translations';

interface SavingsProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const Savings: React.FC<SavingsProps> = ({ account, updateAccount }) => {
  const [selectedGoalForAdd, setSelectedGoalForAdd] = useState<SavingsGoal | null>(null);
  const [selectedGoalForWithdraw, setSelectedGoalForWithdraw] = useState<SavingsGoal | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const lang = account.language || 'id';
  const t = translations[lang].savings;

  const handleSaveToGoal = () => {
    const val = parseInt(amount);
    if (!selectedGoalForAdd || isNaN(val) || val <= 0 || val > account.balance) return;

    updateAccount(prev => {
      const updatedGoals = prev.goals.map(g => 
        g.id === selectedGoalForAdd.id ? { ...g, currentAmount: g.currentAmount + val } : g
      );
      const newTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: TransactionType.EXPENSE,
        category: 'Tabungan',
        amount: val,
        description: `${lang === 'id' ? 'Menabung ke' : 'Save to'} ${selectedGoalForAdd.name}`,
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED' as const
      };

      return {
        ...prev,
        balance: prev.balance - val,
        goals: updatedGoals,
        transactions: [...prev.transactions, newTransaction]
      };
    });

    setAmount('');
    setSelectedGoalForAdd(null);
  };

  const handleWithdrawFromGoal = () => {
    const val = parseInt(amount);
    if (!selectedGoalForWithdraw || isNaN(val) || val <= 0 || val > selectedGoalForWithdraw.currentAmount) return;

    updateAccount(prev => {
      const updatedGoals = prev.goals.map(g => 
        g.id === selectedGoalForWithdraw.id ? { ...g, currentAmount: g.currentAmount - val } : g
      );
      const newTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        type: TransactionType.INCOME,
        category: 'Tabungan',
        amount: val,
        description: `${lang === 'id' ? 'Ambil dari' : 'Withdraw from'} ${selectedGoalForWithdraw.name}`,
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED' as const
      };

      return {
        ...prev,
        balance: prev.balance + val,
        goals: updatedGoals,
        transactions: [...prev.transactions, newTransaction]
      };
    });

    setAmount('');
    setSelectedGoalForWithdraw(null);
  };

  const handleCreateGoal = () => {
    const target = parseInt(newGoalTarget);
    if (!newGoalName || isNaN(target) || target <= 0) return;

    updateAccount(prev => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: newGoalName,
          targetAmount: target,
          currentAmount: 0,
          category: lang === 'id' ? "Lainnya" : "Others"
        }
      ]
    }));

    setNewGoalName('');
    setNewGoalTarget('');
    setIsAddingGoal(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h1>
      
      <div className="space-y-6">
        {account.goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">{goal.name}</h3>
                  <p className="text-xs text-gray-400">{goal.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{Math.round(progress)}%</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.collected}</p>
                  <p className="text-sm font-bold text-gray-800">Rp{goal.currentAmount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.target}</p>
                  <p className="text-sm text-gray-600">Rp{goal.targetAmount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => { setAmount(''); setSelectedGoalForAdd(goal); }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  {t.add}
                </button>
                <button 
                  onClick={() => { setAmount(''); setSelectedGoalForWithdraw(goal); }}
                  disabled={goal.currentAmount <= 0}
                  className="flex-1 py-2 border-2 border-red-100 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  {t.withdraw}
                </button>
              </div>
            </div>
          );
        })}

        <button 
          onClick={() => setIsAddingGoal(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-400 transition-colors"
        >
          <i className="fa-solid fa-plus-circle"></i>
          <span className="font-semibold">{t.newGoal}</span>
        </button>
      </div>

      {/* Save to Goal Modal */}
      {selectedGoalForAdd && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t.modalSave} {selectedGoalForAdd.name}</h2>
              <button onClick={() => setSelectedGoalForAdd(null)}><i className="fa-solid fa-xmark text-gray-400 text-xl"></i></button>
            </div>
            <p className="text-sm text-gray-500 mb-4 text-center">{t.available}: <span className="font-bold text-gray-800">Rp{account.balance.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span></p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <button onClick={handleSaveToGoal} disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > account.balance} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 transition-opacity">
              {t.transferToGoal}
            </button>
          </div>
        </div>
      )}

      {/* Withdraw from Goal Modal */}
      {selectedGoalForWithdraw && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t.modalTake} {selectedGoalForWithdraw.name}</h2>
              <button onClick={() => setSelectedGoalForWithdraw(null)}><i className="fa-solid fa-xmark text-gray-400 text-xl"></i></button>
            </div>
            <p className="text-sm text-gray-500 mb-4 text-center">{t.collected}: <span className="font-bold text-red-500">Rp{selectedGoalForWithdraw.currentAmount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span></p>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-gray-50 border-none p-4 pl-12 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <button onClick={handleWithdrawFromGoal} disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > selectedGoalForWithdraw.currentAmount} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 disabled:opacity-50 transition-opacity">
              {t.transferToMain}
            </button>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{lang === 'id' ? 'Target Baru' : 'New Goal'}</h2>
              <button onClick={() => setIsAddingGoal(false)}><i className="fa-solid fa-xmark text-gray-400 text-xl"></i></button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{lang === 'id' ? 'Nama Target' : 'Goal Name'}</label>
                <input type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder={t.placeholderName} className="w-full bg-gray-50 border-none p-4 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{lang === 'id' ? 'Jumlah Target (Rp)' : 'Target Amount (Rp)'}</label>
                <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="0" className="w-full bg-gray-50 border-none p-4 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>
            <button onClick={handleCreateGoal} disabled={!newGoalName || !newGoalTarget} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 transition-opacity">
              {lang === 'id' ? 'Buat Sekarang' : 'Create Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
