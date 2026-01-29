
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (phone: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) return;
    
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin(`0${phone}`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white text-4xl shadow-2xl shadow-blue-200 mb-8 animate-bounce-in">
          <i className="fa-solid fa-wallet"></i>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">SimpanDuit</h1>
        <p className="text-gray-500 text-center mb-12">Kelola keuanganmu dengan lebih cerdas dan aman.</p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-3 block tracking-widest">Nomor HP Kamu</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-blue-600 transition-colors">+62</span>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="812 3456 7890"
                className="w-full bg-gray-50 border-2 border-gray-50 p-5 pl-16 rounded-[24px] text-lg font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={phone.length < 9 || isLoading}
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin"></i>
                <span>Menghubungkan...</span>
              </>
            ) : (
              <>
                <span>Mulai Sekarang</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="w-full text-center pb-4">
        <p className="text-xs text-gray-400">
          Dengan mendaftar, Anda menyetujui <span className="text-blue-600 font-bold">Syarat & Ketentuan</span> kami.
        </p>
      </div>

      <style>{`
        .animate-bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes bounceIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Login;
