
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserAccount, TransactionType } from '../types';
import { translations } from '../translations';

interface TransferProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const Transfer: React.FC<TransferProps> = ({ account, updateAccount }) => {
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const lang = account.language || 'id';
  const t = translations[lang].transfer;

  useEffect(() => {
    if (location.state && (location.state as any).scannedPhone) {
      setPhone((location.state as any).scannedPhone.replace('+62', '').replace(/-/g, ''));
    }
  }, [location]);

  const handleSend = () => {
    const value = parseInt(amount);
    if (!phone || isNaN(value) || value <= 0 || value > account.balance) return;

    updateAccount(prev => ({
      ...prev,
      balance: prev.balance - value,
      transactions: [
        ...prev.transactions,
        {
          id: Math.random().toString(36).substr(2, 9),
          type: TransactionType.EXPENSE,
          category: 'Transfer',
          amount: value,
          description: `${lang === 'id' ? 'Transfer ke' : 'Transfer to'} ${phone}${note ? ': ' + note : ''}`,
          date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED' as const
        }
      ]
    }));

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setPhone('');
      setAmount('');
      setNote('');
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-bounce-in min-h-[80vh]">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-xl shadow-green-100">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t.success}</h2>
        <p className="text-gray-500 mt-2">Rp{parseInt(amount).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')} {t.successDetail} {phone}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
          <i className="fa-solid fa-paper-plane"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">{t.recipient}</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+62</span>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
              placeholder="812 3456 7890" 
              className="w-full bg-white border border-gray-100 p-4 pl-14 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-blue-600 outline-none shadow-sm transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">{t.amount}</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-100 p-4 pl-12 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-blue-600 outline-none shadow-sm" />
          </div>
          <p className="mt-2 text-xs text-gray-400">{lang === 'id' ? 'Saldo saat ini' : 'Current balance'}: <span className="font-bold text-gray-600">Rp{account.balance.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span></p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block tracking-wider">{t.note}</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang === 'id' ? "Tulis pesan..." : "Write a note..."} className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none shadow-sm h-24 resize-none" />
        </div>

        <button onClick={handleSend} disabled={!phone || !amount || parseInt(amount) > account.balance || parseInt(amount) <= 0} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 disabled:opacity-50 transition-all active:scale-[0.98]">
          {t.sendNow}
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-bold text-gray-800 mb-4">{t.frequent}</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {account.contacts.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">{lang === 'id' ? 'Belum ada kontak.' : 'No contacts yet.'}</p>
          ) : (
            account.contacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => setPhone(contact.phone)} 
                className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer active:scale-90 transition-transform"
              >
                <div className={`w-14 h-14 ${contact.color} rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                  {contact.name[0]}
                </div>
                <span className="text-xs font-medium text-gray-600 truncate w-16 text-center">{contact.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;
