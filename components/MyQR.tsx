
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAccount } from '../types';

interface MyQRProps {
  account: UserAccount;
}

const MyQR: React.FC<MyQRProps> = ({ account }) => {
  const navigate = useNavigate();
  
  // Use a public QR code generation API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=simpanduit:${account.phone}`;

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center p-6 text-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h1 className="font-bold text-lg">QR Saya</h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* QR Card */}
        <div className="bg-white rounded-[40px] p-10 shadow-2xl w-full flex flex-col items-center relative overflow-hidden">
          {/* Logo overlay pattern */}
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
          
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mb-8 overflow-hidden">
            {account.profileImage ? (
              <img src={account.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-wallet"></i>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-3xl border-2 border-dashed border-gray-200 mb-8">
            <div className="bg-white p-2 rounded-2xl shadow-sm">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-gray-900 text-xl font-black mb-1">{account.name}</h2>
            <p className="text-blue-600 font-bold tracking-widest text-lg">{account.phone}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full mt-10">
          <button className="bg-white/10 backdrop-blur-md py-4 rounded-2xl flex flex-col items-center gap-2 border border-white/20">
            <i className="fa-solid fa-download text-xl"></i>
            <span className="text-xs font-bold uppercase tracking-wider">Unduh</span>
          </button>
          <button className="bg-white/10 backdrop-blur-md py-4 rounded-2xl flex flex-col items-center gap-2 border border-white/20">
            <i className="fa-solid fa-share-nodes text-xl"></i>
            <span className="text-xs font-bold uppercase tracking-wider">Bagikan</span>
          </button>
        </div>
      </div>

      <div className="py-8 text-center opacity-60">
        <p className="text-xs">Tunjukkan kode ini kepada temanmu untuk menerima saldo SimpanDuit.</p>
      </div>
    </div>
  );
};

export default MyQR;
