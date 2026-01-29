
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAccount, AppLanguage } from '../types';
import { translations } from '../translations';

interface ProfileProps {
  account: UserAccount;
  onLogout: () => void;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

const Profile: React.FC<ProfileProps> = ({ account, onLogout, updateAccount }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(account.name);
  
  const lang = account.language || 'id';
  const t = translations[lang].profile;

  const handleSaveName = () => {
    if (newName.trim()) {
      updateAccount(prev => ({ ...prev, name: newName }));
      setIsEditingName(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateAccount(prev => ({ ...prev, profileImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const setLanguage = (newLang: AppLanguage) => {
    updateAccount(prev => ({ ...prev, language: newLang }));
  };

  return (
    <div className="p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-gray-600">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center mb-6">
        <div className="relative">
          <div 
            onClick={handleImageClick}
            className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-4xl mb-4 border-4 border-white shadow-lg shadow-blue-50 cursor-pointer overflow-hidden group"
          >
            {account.profileImage ? (
              <img src={account.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <i className="fa-solid fa-camera text-white text-lg"></i>
            </div>
          </div>
          <div className="absolute bottom-4 right-0 w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-md pointer-events-none">
            <i className="fa-solid fa-camera"></i>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {isEditingName ? (
          <div className="w-full flex flex-col gap-2">
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Masukkan nama"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-center font-bold text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={handleSaveName} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Simpan</button>
              <button onClick={() => setIsEditingName(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">Batal</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
            <h2 className="text-xl font-bold text-gray-800 truncate max-w-[200px]">{account.name}</h2>
            <i className="fa-solid fa-pen text-xs text-gray-300 group-hover:text-blue-500"></i>
          </div>
        )}
        
        <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest mt-2">{t.premium}</span>
      </div>

      {/* Info List */}
      <div className="space-y-4 mb-auto">
        {/* Language Selection Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">{t.language}</p>
           <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setLanguage('id')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${lang === 'id' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
              >
                Bahasa Indonesia
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${lang === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
              >
                English
              </button>
           </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <i className="fa-solid fa-phone"></i>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.phone}</p>
              <p className="font-bold text-gray-800">{account.phone}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.security}</p>
              <p className="font-bold text-gray-800">{t.securityDetail}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-gray-200"></i>
        </div>

        {/* Hidden Admin Entry */}
        <div 
          onClick={() => navigate('/admin')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.advanced}</p>
              <p className="font-bold text-gray-800">{t.admin}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-gray-200"></i>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors mt-6 mb-20"
      >
        <i className="fa-solid fa-right-from-bracket"></i>
        {t.logout}
      </button>
    </div>
  );
};

export default Profile;
