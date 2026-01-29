
import { GoogleGenAI, Type } from "@google/genai";
import { UserAccount } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (account: UserAccount, query: string) => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    Anda adalah asisten keuangan pribadi bernama 'DuitBuddy' untuk aplikasi 'SimpanDuit'.
    Tugas Anda adalah memberikan saran keuangan yang bijak, memotivasi pengguna untuk menabung,
    dan menganalisis pola pengeluaran mereka berdasarkan data akun yang diberikan.
    Gunakan gaya bahasa yang ramah, profesional, dan mudah dimengerti.
    
    PENTING: Responlah menggunakan Bahasa ${account.language === 'id' ? 'Indonesia' : 'Inggris'}.
    
    Data Akun Pengguna:
    - Saldo: Rp${account.balance.toLocaleString('id-ID')}
    - Transaksi Terakhir: ${account.transactions.slice(0, 5).map(t => `${t.description} (Rp${t.amount.toLocaleString('id-ID')})`).join(', ')}
    - Target Tabungan: ${account.goals.map(g => `${g.name} (Tercapai: ${Math.round((g.currentAmount/g.targetAmount)*100)}%)`).join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return account.language === 'id' 
      ? "Maaf, DuitBuddy sedang tidak bisa terhubung. Coba lagi nanti ya!" 
      : "Sorry, DuitBuddy is currently unavailable. Please try again later!";
  }
};
