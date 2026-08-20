import { useState } from 'react';
import { BACKEND_URL } from '../../../config/socket.js';

export default function SettingPage() {
  const [loading, setLoading] = useState(false); 
  const token = localStorage.getItem("admin_token");
  
  const authHeader = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const handleReset = async () => {
    // Konfirmasi ganda untuk mencegah salah klik
    const confirmReset = window.confirm("PERINGATAN: Apakah Anda yakin ingin mereset seluruh event? Semua data pemenang akan dihapus!");
    
    if (!confirmReset) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}}/api/admin/resetevent`, {
        method: 'POST',
        headers: authHeader
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Gagal melakukan reset');

      alert("Berhasil! Event telah di-reset dari nol.");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full center-flex flex-col flex-1">
      <h2 className="text-biru font-black mb-5 text-5xl">Reset Event?</h2>
      <button 
        onClick={handleReset}
        disabled={loading}
        className={`text-white text-2xl font-bold py-5 px-10 rounded-pill smooth-transition 
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-[0_10px_20px_rgba(220,38,38,0.3)]'}
        `}
      >
        {loading ? 'MEMPROSES...' : 'YES RESET SEMUA'}
      </button>
      <p className="mt-4 text-gray-500 font-medium">Ini akan menghapus daftar pemenang dan mereset status peserta.</p>
    </div>
  );
}