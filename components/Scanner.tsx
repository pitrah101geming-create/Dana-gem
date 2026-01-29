
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const simulateScan = () => {
    // Simulate finding a phone number from QR
    const randomPhones = ["0812-9988-7766", "0855-4433-2211", "0813-1111-2222"];
    const phone = randomPhones[Math.floor(Math.random() * randomPhones.length)];
    
    navigate('/transfer', { state: { scannedPhone: phone } });
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden flex flex-col">
      {/* Camera Feed */}
      <div className="absolute inset-0 z-0">
        {hasPermission === false ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-10 text-center">
            <i className="fa-solid fa-camera-slash text-5xl mb-4 text-gray-500"></i>
            <h2 className="text-xl font-bold mb-2">Akses Kamera Ditolak</h2>
            <p className="text-gray-400 text-sm">Mohon izinkan akses kamera untuk menggunakan fitur Pindai QR.</p>
            <button 
                onClick={() => navigate('/')}
                className="mt-6 px-6 py-2 bg-blue-600 rounded-full font-bold"
            >
                Kembali ke Beranda
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover grayscale-[30%]"
          />
        )}
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
          <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h2 className="text-white font-bold">Pindai QR</h2>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <i className="fa-solid fa-bolt"></i>
          </div>
        </div>

        {/* Scanner Box */}
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="relative w-full aspect-square max-w-[280px]">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            
            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[scan_2s_infinite] shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto flex flex-col items-center gap-6">
          <p className="text-white/80 text-sm text-center">Arahkan kamera ke kode QR untuk mengirim uang secara otomatis</p>
          
          <div className="flex justify-center gap-12 text-white">
            <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl">
                    <i className="fa-solid fa-image"></i>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Galeri</span>
            </div>
            <div 
                onClick={simulateScan}
                className="flex flex-col items-center gap-2 cursor-pointer"
            >
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-500/50">
                    <i className="fa-solid fa-qrcode"></i>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Simulasi</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl">
                    <i className="fa-solid fa-id-card"></i>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">ID Saya</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
