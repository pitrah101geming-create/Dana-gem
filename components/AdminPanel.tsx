
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAccount, TransactionType, Transaction } from '../types';

interface AdminPanelProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ account, updateAccount }) => {
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const ADMIN_CODE = "123admin";

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Kode admin salah!');
      setCode('');
    }
  };

  const handleAddMoney = () => {
    const value = parseInt(amountToAdd);
    if (isNaN(value) || value <= 0) {
      setError('Masukkan jumlah yang valid');
      return;
    }

    updateAccount(prev => ({
      ...prev,
      balance: prev.balance + value,
      transactions: [
        ...prev.transactions,
        {
          id: 'admin-' + Date.now(),
          type: TransactionType.INCOME,
          category: 'Sistem',
          amount: value,
          description: 'Penambahan Dana Admin',
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED'
        }
      ]
    }));

    setSuccess(`Berhasil menambahkan Rp ${value.toLocaleString('id-ID')}`);
    setAmountToAdd('');
    setError('');
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVerifyTopUp = (transactionId: string) => {
    const txn = account.transactions.find(t => t.id === transactionId);
    if (!txn) return;

    const isVipPurchase = txn.category === 'VIP' || txn.description.toLowerCase().includes('vip');

    updateAccount(prev => {
      const updatedTransactions = prev.transactions.map(t => 
        t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      );
      
      let newVipStatus = prev.vip;
      if (isVipPurchase) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 5);
        newVipStatus = {
          isActive: true,
          expiryDate: expiry.toISOString(),
          lastClaimDate: '' // Ready for first claim
        };
      }

      return {
        ...prev,
        // Balance only increases for normal top-ups, VIP is a different mechanism (daily bonus)
        balance: isVipPurchase ? prev.balance : prev.balance + txn.amount,
        transactions: updatedTransactions,
        vip: newVipStatus
      };
    });

    setSuccess(isVipPurchase 
      ? `VIP Sultan Berhasil Diaktifkan Selama 5 Hari!` 
      : `Berhasil verifikasi Top Up Rp ${txn.amount.toLocaleString('id-ID')}`
    );
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetGoals = () => {
    if (!window.confirm("Apakah Anda yakin ingin me-reset SEMUA progress tabungan menjadi 0?")) return;

    updateAccount(prev => ({
      ...prev,
      goals: prev.goals.map(goal => ({ ...goal, currentAmount: 0 })),
      transactions: [
        ...prev.transactions,
        {
          id: 'admin-reset-' + Date.now(),
          type: TransactionType.EXPENSE,
          category: 'Sistem',
          amount: 0,
          description: 'Reset Seluruh Tabungan Admin',
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED'
        }
      ]
    }));

    setSuccess("Seluruh progress tabungan telah di-reset ke 0.");
    setTimeout(() => setSuccess(''), 3000);
  };

  const pendingTopUps = account.transactions.filter(t => t.status === 'PENDING');

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-white">
        <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-slate-900 text-3xl mb-6 shadow-xl shadow-amber-500/20">
          <i className="fa-solid fa-lock"></i>
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Terbatas</h1>
        <p className="text-slate-400 text-center mb-8">Masukkan kode admin untuk melanjutkan.</p>
        
        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-4">
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Kode Admin"
              className="w-full bg-slate-800 border-2 border-slate-700 p-4 pr-12 rounded-2xl text-center text-xl tracking-[0.2em] focus:border-amber-500 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-600"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 transition-colors"
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          
          {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}
          
          <button 
            type="submit"
            className="w-full py-4 bg-amber-500 text-slate-900 rounded-2xl font-bold text-lg hover:bg-amber-400 transition-colors active:scale-95 shadow-lg shadow-amber-500/10"
          >
            Buka Panel
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full py-2 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            Batal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h1 className="text-xl font-bold">Admin Controls</h1>
      </div>

      <div className="space-y-6">
        {/* Pending Verification Section */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <h2 className="text-lg font-bold">Verifikasi Top Up / VIP</h2>
            {pendingTopUps.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce ml-2">{pendingTopUps.length}</span>
            )}
          </div>

          <div className="space-y-4">
            {pendingTopUps.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4 italic">Tidak ada antrian top up saat ini.</p>
            ) : (
              pendingTopUps.map(txn => (
                <div key={txn.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-bold ${txn.category === 'VIP' ? 'text-amber-400' : 'text-slate-200'}`}>{txn.description}</p>
                      <p className="text-xs text-slate-500">{txn.date}</p>
                    </div>
                    <p className={`text-lg font-black ${txn.category === 'VIP' ? 'text-amber-400' : 'text-blue-400'}`}>
                      {txn.category === 'VIP' ? 'PACKAGE' : `Rp${txn.amount.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleVerifyTopUp(txn.id)}
                    className={`w-full py-3 ${txn.category === 'VIP' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-xl font-bold text-sm transition-colors active:scale-[0.98]`}
                  >
                    {txn.category === 'VIP' ? 'Verifikasi & Aktifkan VIP Sultan' : 'Verifikasi & Tambah Saldo'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Regular Admin Tools */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <h2 className="text-lg font-bold">Tambah Saldo Instan</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Jumlah (Rp)</label>
              <input 
                type="number"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-2xl font-bold text-amber-400 focus:border-amber-500 outline-none transition-all"
              />
            </div>

            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            {success && <p className="text-green-400 text-sm font-medium">{success}</p>}

            <button 
              onClick={handleAddMoney}
              className="w-full py-4 bg-amber-500 text-slate-900 rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform"
            >
              Suntik Dana Sekarang
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-rotate-left"></i>
            </div>
            <h2 className="text-lg font-bold">Reset Tabungan</h2>
          </div>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Gunakan fitur ini untuk mengosongkan seluruh dana yang tersimpan di dalam Target Tabungan tanpa mengembalikan ke saldo utama.
          </p>

          <button 
            onClick={handleResetGoals}
            className="w-full py-4 border-2 border-red-500 text-red-500 rounded-2xl font-bold text-lg hover:bg-red-500/10 active:scale-[0.98] transition-all"
          >
            Reset Semua Menjadi Rp 0
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
