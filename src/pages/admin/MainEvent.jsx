import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Config & Hooks
import { socket, BACKEND_URL } from '../../config/socket.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useConfirmDialog from '../../hooks/useConfirmDialog.js';

// Components
import AppSnackbar from '../../components/ui/AppSnackbar.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton.jsx';

export default function MainEventPage() {
  const navigate = useNavigate();
  
  // Hooks UI
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { dialog: confirmDialog, openConfirm, closeConfirm } = useConfirmDialog();

  // State
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [liveSessionId, setLiveSessionId] = useState(null);
  const [isProjectorActive, setIsProjectorActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. INIT DATA & SINKRONISASI BACKEND
  const fetchSessionsAndState = async () => {
    setLoading(true);
    try {
      const resSessions = await fetch(`${BACKEND_URL}/api/spin/sessions`);
      const dataSessions = await resSessions.json();
      
      let dbSessions = dataSessions.data.map((s) => ({
        id_kelompok: s.id_kelompok,
        nama_kelompok: s.nama_kelompok,
        tipe_event: s.tipe_event,
        target_jumlah_pemenang: s.target_jumlah_pemenang,
        status_sesi: s.status_sesi === 'complate' ? 'completed' : s.status_sesi
      }));
      setSessions(dbSessions);

      const resState = await fetch(`${BACKEND_URL}/api/spin/current`);
      const stateData = await resState.json();
      const { sessionData } = stateData.data;

      const activeDbSession = dbSessions.find(s => s.status_sesi === 'active');

      if (sessionData || activeDbSession) {
        setIsProjectorActive(true);
        const targetSession = sessionData 
          ? dbSessions.find(s => s.id_kelompok === sessionData.id_kelompok)
          : activeDbSession;

        if (targetSession) {
          setLiveSessionId(targetSession.id_kelompok);
          setSelectedSession(targetSession);
        }
      } else {
        const firstPending = dbSessions.find(s => s.status_sesi === 'pending');
        if (firstPending) setSelectedSession(firstPending);
        else if (dbSessions.length > 0) setSelectedSession(dbSessions[0]);
      }
    } catch (err) {
      console.error("Gagal load data sesi real:", err);
      showSnackbar({ message: "Gagal terhubung ke server", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessionsAndState(); }, []);

  // 2. SOCKET LISTENER
  useEffect(() => {
    socket.on('SESSION_CHANGED', (newSession) => {
      setLiveSessionId(newSession.id_kelompok);
      setIsProjectorActive(true); 
      setSessions(prev => {
        const found = prev.find(s => s.id_kelompok === newSession.id_kelompok);
        if (found) setSelectedSession(found);
        return prev;
      });
    });

    socket.on('SPIN_RESULT', () => {
      setSessions(prev => prev.map(s => {
        if (s.id_kelompok === liveSessionId) return { ...s, status_sesi: 'completed' };
        return s;
      }));
    });

    socket.on('STAGE_CLEARED', () => {
      setIsProjectorActive(false);
      setLiveSessionId(null);
    });

    socket.on('ALL_COMPLETED', () => {
      showSnackbar({ message: "Seluruh Sesi Undian Telah Selesai!", severity: "success" });
      setLiveSessionId(null);
      setSessions(prev => prev.map(s => ({ ...s, status_sesi: 'completed' })));
    });

    return () => {
      socket.off('SESSION_CHANGED');
      socket.off('SPIN_RESULT');
      socket.off('STAGE_CLEARED');
      socket.off('ALL_COMPLETED');
    };
  }, [liveSessionId, showSnackbar]);

  // 3. FUNGSI TOMBOL UTAMA (Logika Aslimu Dikembalikan Sepenuhnya!)
  const handleAction = async () => {
    if (!selectedSession) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/spin/set-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_kelompok: selectedSession.id_kelompok,
          nama_kelompok: selectedSession.nama_kelompok,
          jumlah_slot: selectedSession.target_jumlah_pemenang,
          mode: selectedSession.tipe_event
        })
      });

      setLiveSessionId(selectedSession.id_kelompok);

      // Jika proyektor belum terbuka, buka tab baru
      if (!isProjectorActive) {
        localStorage.setItem('active_projector_session', JSON.stringify(selectedSession));
        window.open('/admin/projector', '_blank');
        setIsProjectorActive(true);
      }
    } catch (err) {
      console.error("Gagal mengaktifkan sesi ke panggung:", err);
      showSnackbar({ message: "Gagal terhubung ke panggung", severity: "error" });
    }
  };

  // 4. TUTUP PANGGUNG
  const handleCloseProjector = () => {
    openConfirm({
      title: "Tutup Panggung",
      message: "Yakin ingin menutup panggung? Layar proyektor audiens akan kembali ke mode awal.",
      confirmText: "Tutup Sekarang",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await fetch(`${BACKEND_URL}/api/spin/clear`, { method: 'POST' });
          closeConfirm();
          showSnackbar({ message: "Panggung berhasil ditutup", severity: "success" });
        } catch (err) {
          showSnackbar({ message: "Gagal mematikan panggung", severity: "error" });
        }
      }
    });
  };

  const COLOR_YELLOW = "#f1c335";
  const COLOR_BLUE = "#08415c";

  const getTipeColorClass = (tipe) => {
    switch (tipe) {
      case 'super':
        return 'text-golden'; 
      case 'grand':
        return 'text-olive'; 
      case 'reguler':
        return 'text-[#157145]'; 
      default:
        return 'text-[#08415c]'; 
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col items-center pt-8 pb-16 font-sans overflow-hidden">
      
      {/* Navigasi Rahasia Pemenang */}
      <div className="absolute top-4 right-8">
        <Button 
          variant="text" 
          startIcon={<EmojiEventsIcon />} 
          onClick={() => navigate('/admin/pemenang')}
          sx={{ color: COLOR_BLUE, fontWeight: 'bold' }}
        >
          Riwayat Pemenang
        </Button>
      </div>

      {/* HEADER TABS (Pixel Perfect Sesuai Gambar) */}
      <div className="flex flex-wrap justify-center mb-6 z-10">
        <div className="px-6 py-4 rounded-xl font-extrabold text-lg uppercase tracking-wide cursor-none" style={{ backgroundColor: COLOR_BLUE, color: "white" }}>
          MAIN EVENT
        </div>
      </div>

      {/* KOTAK UTAMA (Pixel Perfect Border Tebal) */}
      <div 
        className="relative w-full max-w-6xl px-5 py-8 shadow-2xl"
        style={{ 
          backgroundColor: COLOR_BLUE, 
          borderRadius: '3.5rem', 
          border: `24px solid ${COLOR_YELLOW}` 
        }}
      >
        {loading ? (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
            <LoadingSkeleton variant="rectangular" height={70} count={9} className="rounded-full w-[30%]" />
          </div>
        ) : (
          /* UX Maksimal pada Grid Pill Buttons */
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 px-4">
            {sessions.length === 0 ? (
              <p className="text-white text-xl font-bold py-10 opacity-70">Belum ada sesi tersimpan.</p>
            ) : (
              sessions.map((sesi) => {
                const isLive = liveSessionId === sesi.id_kelompok;
                const isSelected = selectedSession?.id_kelompok === sesi.id_kelompok;
                const isCompleted = sesi.status_sesi === 'completed';

                return (
                  <button
                    key={sesi.id_kelompok}
                    onClick={() => setSelectedSession(sesi)}
                    disabled={isCompleted}
                    className={`
                      relative flex flex-col items-center justify-center w-[28%] min-w-60 py-2 px-6 rounded-4xl transition-all duration-200 overflow-hidden
                      ${isCompleted ? 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed shadow-inner' : `bg-white hover:scale-105 hover:shadow-[0_5px_15px_rgba(0,0,0,0.3)] ${getTipeColorClass(sesi.tipe_event)}`}
                      ${isLive ? 'ring-6 ring-green-400 bg-green-50 shadow-[0_0_20px_rgba(74,222,128,0.6)] text-green-700!' : ''}
                      ${isSelected && !isLive ? `ring-6 ring-kuning scale-105 z-10` : ''}
                    `}
                  >
                    <span className="font-black text-sm md:text-md uppercase tracking-wide">{sesi.nama_kelompok}</span>
                    <span className="text-sm font-semibold opacity-80">{sesi.target_jumlah_pemenang} Pemenang</span>
                    
                    {/* Badge Live UX */}
                    {isLive && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl tracking-widest animate-pulse">
                        LIVE
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* TOMBOL KONTROL BAWAH (Logika Asli Dikembalikan) */}
      <div className="mt-8 z-10 flex flex-wrap justify-center items-center gap-6">
        
        {/* Tombol Utama (Buka Proyektor / Terapkan / Sedang Tayang) */}
        <button
          onClick={handleAction}
          disabled={!selectedSession || liveSessionId === selectedSession?.id_kelompok}
          className="px-12 py-4 rounded-full font-black text-2xl md:text-3xl tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: (!isProjectorActive || liveSessionId === selectedSession?.id_kelompok) ? COLOR_YELLOW : '#10b981', 
            color: (!isProjectorActive || liveSessionId === selectedSession?.id_kelompok) ? COLOR_BLUE : 'white' 
          }}
        >
          {!isProjectorActive 
            ? 'BUKA PROJEKTOR' 
            : (liveSessionId === selectedSession?.id_kelompok ? 'SEDANG TAYANG' : 'TERAPKAN KE PANGGUNG')
          }
        </button>

        {/* Tombol Tutup Panggung (Muncul disamping kalau proyektor nyala) */}
        {isProjectorActive && (
          <button
            onClick={handleCloseProjector}
            className="px-8 py-4 rounded-full font-black text-xl tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-xl bg-red-600 hover:bg-red-700 text-white border-4 border-red-800"
          >
            TUTUP PANGGUNG
          </button>
        )}
      </div>

      {/* MODAL & SNACKBAR */}
      <ConfirmDialog 
        open={confirmDialog.open} 
        onClose={closeConfirm} 
        onConfirm={confirmDialog.onConfirm} 
        title={confirmDialog.title} 
        message={confirmDialog.message} 
        confirmText={confirmDialog.confirmText} 
        cancelText={confirmDialog.cancelText} 
      />
      <AppSnackbar 
        open={snackbar.open} 
        message={snackbar.message} 
        severity={snackbar.severity} 
        duration={snackbar.duration} 
        anchorOrigin={snackbar.anchorOrigin} 
        onClose={closeSnackbar} 
      />
    </div>
  );
}