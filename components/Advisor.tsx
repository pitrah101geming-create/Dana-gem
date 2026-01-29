
import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, Contact } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { translations } from '../translations';

interface AdvisorProps {
  account: UserAccount;
  updateAccount: (updater: (prev: UserAccount) => UserAccount) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Advisor: React.FC<AdvisorProps> = ({ account, updateAccount }) => {
  const lang = account.language || 'id';
  const t = translations[lang].advisor;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Halo ${account.name}! ${t.welcome}`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  
  // Form State for New Contact
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const advice = await getFinancialAdvice(account, textToSend);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: advice || "Maaf, saya tidak bisa memproses permintaan Anda saat ini.",
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact: Contact = {
      id: 'c-' + Date.now(),
      name: newContactName,
      phone: newContactPhone,
      color: randomColor
    };

    updateAccount(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));

    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
    
    // Notify in chat
    setMessages(prev => [...prev, {
      id: 'notif-' + Date.now(),
      text: lang === 'id' 
        ? `Kontak "${newContactName}" berhasil ditambahkan ke daftar kirim kamu!` 
        : `Contact "${newContactName}" has been added to your send list!`,
      sender: 'ai',
      timestamp: new Date()
    }]);
  };

  const handleContactAdmin = () => {
    // Simulate opening admin chat
    setMessages(prev => [...prev, {
      id: 'admin-notif-' + Date.now(),
      text: t.adminMsg,
      sender: 'user',
      timestamp: new Date()
    }, {
      id: 'admin-reply-' + Date.now(),
      text: lang === 'id' 
        ? "Pesan bantuanmu telah terkirim ke Admin. Kami akan segera merespons." 
        : "Your support message has been sent to Admin. We will respond shortly.",
      sender: 'ai',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <i className="fa-solid fa-robot text-xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-gray-800">DuitBuddy AI</h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
        <button 
          onClick={handleContactAdmin}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-bold whitespace-nowrap border border-amber-100 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-headset"></i>
          {t.contactAdmin}
        </button>
        <button 
          onClick={() => setShowAddContact(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold whitespace-nowrap border border-blue-100 active:scale-95 transition-all"
        >
          <i className="fa-solid fa-user-plus"></i>
          {t.addContact}
        </button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32"
      >
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.text}
              <div className={`text-[10px] mt-2 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-20 left-0 right-0 p-4 bg-transparent shrink-0">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 flex items-center gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'id' ? "Tanyakan sesuatu..." : "Ask something..."}
            className="flex-1 bg-transparent border-none px-4 py-2 focus:ring-0 outline-none text-sm font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200"
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t.modalTitle}</h2>
              <button onClick={() => setShowAddContact(false)}>
                <i className="fa-solid fa-xmark text-gray-400"></i>
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.nameLabel}</label>
                <input 
                  type="text" 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contoh: Andi"
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.phoneLabel}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+62</span>
                  <input 
                    type="tel" 
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="8123456789"
                    className="w-full bg-gray-50 border-none p-4 pl-14 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddContact}
              disabled={!newContactName || !newContactPhone}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all"
            >
              {t.saveBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advisor;
