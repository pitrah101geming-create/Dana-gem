
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAccount, TransactionType } from '../types';
import { translations } from '../translations';

interface TopUpProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const TopUp: React.FC<TopUpProps> = ({ account, updateAccount }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ amount: number, price: number, isVip?: boolean } | null>(null);

  const lang = account.language || 'id';
  const t = translations[lang].topup;

  const packages = [
    { amount: 50000, price: 51000 },
    { amount: 100000, price: 101000 },
    { amount: 500000, price: 501000 },
    { amount: 1000000, price: 1001000 },
  ];

  const VIP_PACKAGE = {
    amount: 0, // 0 initial balance, it's a subscription
    price: 200000000,
    name: t.vipTitle,
    isVip: true
  };

  const handleTopUp = (pkg: { amount: number, price: number, isVip?: boolean }) => {
    setSelectedPackage(pkg);
  };

  const confirmTopUp = () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const description = selectedPackage.isVip 
        ? `Purchase ${VIP_PACKAGE.name}` 
        : `Top Up Saldo Rp${selectedPackage.amount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}`;

      updateAccount(prev => ({
        ...prev,
        transactions: [
          ...prev.transactions,
          {
            id: 'topup-' + Date.now(),
            type: TransactionType.INCOME,
            category: selectedPackage.isVip ? 'VIP' : 'Top Up',
            amount: selectedPackage.isVip ? selectedPackage.price : selectedPackage.amount,
            description: description,
            date: new Date().toISOString().split('T')[0],
            status: 'PENDING'
          }
        ]
      }));
      
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess && selectedPackage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 text-center">
        <div className="w-24 h-24 bg-amber-500 text-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl shadow-amber-100 animate-pulse">
          <i className="fa-solid fa-clock-rotate-left"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t.wait}</h2>
        <p className="text-gray-500 mt-2 mb-8 leading-relaxed">
          {selectedPackage.isVip ? (
            lang === 'id' 
              ? "Permintaan Aktivasi VIP Sultan telah diterima." 
              : "Sultan VIP Activation request has been received."
          ) : (
            `${lang === 'id' ? 'Top up sebesar' : 'Top up of'} Rp${selectedPackage.amount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} ${lang === 'id' ? 'diterima' : 'received'}.`
          )}
          <br/><br/>
          {t.waitDetail}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold"
        >
          {lang === 'id' ? 'Ke Beranda' : 'Back to Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 p-6 flex items-center gap-4 sticky top-0 z-20">
        <button onClick={() => navigate('/')} className="text-gray-600">
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
      </div>

      <div className="p-6 flex-1">
        <div className="bg-blue-600 rounded-3xl p-6 text-white mb-8 shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-xs mb-1">{t.current}</p>
          <p className="text-2xl font-bold">Rp{account.balance.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
        </div>

        {/* VIP Sultan Offer */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t.promo}</h2>
          <div 
            onClick={() => handleTopUp({ amount: 0, price: VIP_PACKAGE.price, isVip: true })}
            className={`bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-3xl p-6 text-white cursor-pointer transition-transform active:scale-95 shadow-xl shadow-orange-100 relative overflow-hidden border-4 ${selectedPackage?.isVip ? 'border-blue-400' : 'border-transparent'}`}
          >
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-crown text-amber-100"></i>
                <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest inline-block">Flash Deal VIP</span>
              </div>
              <h3 className="text-xl font-black">{VIP_PACKAGE.name}</h3>
              <p className="text-amber-100 text-[11px] font-medium mt-1">{t.vipBenefit}</p>
              
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-amber-100 text-[10px] uppercase font-bold">Total Bonus</p>
                  <p className="text-2xl font-black">Rp50.000.000</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-100 text-[10px] uppercase font-bold">Investasi</p>
                  <p className="text-xl font-bold">Rp200jt</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t.other}</h2>
          <div className="grid grid-cols-2 gap-4">
            {packages.map((pkg, idx) => (
              <div 
                key={idx}
                onClick={() => handleTopUp({ ...pkg, isVip: false })}
                className={`bg-white border-2 p-5 rounded-2xl cursor-pointer transition-all active:scale-95 ${(!selectedPackage?.isVip && selectedPackage?.amount === pkg.amount) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100'}`}
              >
                <p className="text-xs text-gray-400 mb-1">Rp</p>
                <p className="text-lg font-bold text-gray-800">{pkg.amount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
                <p className="text-[10px] text-blue-600 font-medium mt-2">Harga: Rp{pkg.price.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-fade-in">
          <div className="bg-white w-full rounded-t-[40px] p-8 animate-slide-up">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{t.confirm}</h2>
            
            <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">{lang === 'id' ? 'Produk' : 'Product'}</span>
                <span className="font-bold text-gray-800">{selectedPackage.isVip ? VIP_PACKAGE.name : 'Top Up SimpanDuit'}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400 text-sm">{selectedPackage.isVip ? (lang === 'id' ? 'Masa Aktif' : 'Duration') : (lang === 'id' ? 'Nominal Saldo' : 'Amount')}</span>
                <span className="font-bold text-blue-600 text-lg">
                  {selectedPackage.isVip ? (lang === 'id' ? '5 Hari' : '5 Days') : `Rp${selectedPackage.amount.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}`}
                </span>
              </div>
              <div className="h-px bg-gray-200 w-full mb-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-bold">{lang === 'id' ? 'Total Bayar' : 'Total Price'}</span>
                <span className="font-black text-gray-900 text-xl">Rp{selectedPackage.price.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedPackage(null)} className="flex-1 py-4 text-gray-400 font-bold">{lang === 'id' ? 'Batal' : 'Cancel'}</button>
              <button 
                onClick={confirmTopUp}
                disabled={isProcessing}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>{lang === 'id' ? 'Memproses...' : 'Processing...'}</span>
                  </>
                ) : (
                  <span>{t.pay}</span>
                )}
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">Memerlukan Verifikasi Admin</p>
          </div>
        </div>
      )}

      <style>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default TopUp;
