import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Chip } from '@mui/material';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import SendIcon from '@mui/icons-material/Send';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { socket, BACKEND_URL } from '../../../config/socket.js'; 

export default function MainEventPage() {
  const [sessions, setSessions] = useState([]);
  
  // Sesi yang diklik Admin untuk dilihat preview-nya di kanan
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Sesi yang saat ini sedang TAYANG di proyektor (Live)
  const [liveSessionId, setLiveSessionId] = useState(null);
  
  const [isProjectorActive, setIsProjectorActive] = useState(false);

  // 1. INIT DATA & SINKRONISASI BACKEND
  const fetchSessionsAndState = async () => {
    try {
      // A. Ambil Data Sesi dari Database
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

      // B. Cek Panggung Saat Ini
      const resState = await fetch(`${BACKEND_URL}/api/spin/current`);
      const stateData = await resState.json();
      const { appState, sessionData } = stateData.data;

      if (appState !== 'STANDBY' || sessionData) {
        setIsProjectorActive(true);
        if (sessionData) {
          setLiveSessionId(sessionData.id_kelompok);
          const activeIndex = dbSessions.findIndex(s => s.id_kelompok === sessionData.id_kelompok);
          if (activeIndex !== -1) {
            setSelectedSession(dbSessions[activeIndex]);
          }
        }
      } else {
        // Jika panggung kosong, pilih sesi pending pertama untuk preview
        const firstPendingIndex = dbSessions.findIndex(s => s.status_sesi === 'pending');
        if (firstPendingIndex !== -1) {
          setSelectedSession(dbSessions[firstPendingIndex]);
        } else if (dbSessions.length > 0) {
          setSelectedSession(dbSessions[0]); 
        }
      }
    } catch (err) {
      console.error("Gagal load data sesi real:", err);
    }
  };

  useEffect(() => {
    fetchSessionsAndState();
  }, []);

  // 2. SOCKET LISTENER (Menangkap Perubahan Panggung & Selesai Spin)
  useEffect(() => {
    // Menangkap jika proyektor pindah sesi (entah manual atau auto-next)
    socket.on('SESSION_CHANGED', (newSession) => {
      setLiveSessionId(newSession.id_kelompok);
      setIsProjectorActive(true); 
      
      // Update selected session agar tampilan kanan ikut berubah mengikuti proyektor
      setSessions(prev => {
        const found = prev.find(s => s.id_kelompok === newSession.id_kelompok);
        if (found) setSelectedSession(found);
        return prev;
      });
    });

    // JIKA SPIN BERHENTI (Result Keluar) -> Sesi Ini Resmi Selesai (Completed)
    socket.on('SPIN_RESULT', () => {
      setSessions(prev => prev.map(s => {
        if (s.id_kelompok === liveSessionId) {
          return { ...s, status_sesi: 'completed' };
        }
        return s;
      }));
    });

    // SINKRONISASI JIKA ADA YANG MENEKAN CLEAR DARI TEMPAT LAIN
    socket.on('STAGE_CLEARED', () => {
      setIsProjectorActive(false);
      setLiveSessionId(null);
    });

    socket.on('ALL_COMPLETED', () => {
      alert("Seluruh Sesi Undian Telah Selesai!");
      setLiveSessionId(null);
      setSessions(prev => prev.map(s => ({ ...s, status_sesi: 'completed' })));
    });

    return () => {
      socket.off('SESSION_CHANGED');
      socket.off('SPIN_RESULT');
      socket.off('STAGE_CLEARED');
      socket.off('ALL_COMPLETED');
    };
  }, [liveSessionId]);

  // 3. FUNGSI TOMBOL UTAMA (Buka Tab / Terapkan ke Panggung)
  const handleAction = async () => {
    if (!selectedSession) return;
    
    if (!isProjectorActive) {
      // MODE A: Buka Tab Proyektor
      localStorage.setItem('active_projector_session', JSON.stringify(selectedSession));
      window.open('/admin/projector', '_blank');
      setIsProjectorActive(true); 
      setLiveSessionId(selectedSession.id_kelompok);
    } else {
      // MODE B: Terapkan Sesi yang sedang diklik ke Proyektor
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
      } catch (err) {
        console.error("Gagal mengganti sesi:", err);
      }
    }
  };

  // 4. FUNGSI BARU: TUTUP PANGGUNG (KEMBALI)
  const handleCloseProjector = async () => {
    const confirm = window.confirm("Yakin ingin menutup panggung? Proyektor akan kembali ke mode awal.");
    if (!confirm) return;

    try {
      await fetch(`${BACKEND_URL}/api/spin/clear`, { method: 'POST' });
      // State isProjectorActive dan liveSessionId akan direset otomatis via socket 'STAGE_CLEARED'
    } catch (err) {
      console.error("Gagal menutup panggung:", err);
    }
  };

  const getBadgeColor = (type) => {
    if (type === 'super') return 'bg-golden text-white';
    if (type === 'grand') return 'bg-kuning text-olive';
    return 'bg-biru text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row gap-6 font-sans">
      
      {/* KIRI: LIST SESI */}
      <div className="w-full md:w-1/3 flex flex-col h-[90vh]">
        <div className="bg-biru text-white p-4 rounded-t-xl">
          <h2 className="text-xl font-bold uppercase tracking-wider">Sesi Undian</h2>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-b-xl flex-1 overflow-y-auto p-2 shadow-sm">
          <div className="flex flex-col gap-2">
            {sessions.map((sesi) => (
              <button
                key={sesi.id_kelompok}
                onClick={() => setSelectedSession(sesi)}
                disabled={sesi.status_sesi === 'completed'}
                className={`
                  text-left px-4 py-3 rounded-lg border transition-all flex justify-between items-center relative overflow-hidden
                  ${selectedSession?.id_kelompok === sesi.id_kelompok ? 'border-golden bg-opacity ring-1 ring-golden' : 'border-gray-100 hover:bg-gray-50'}
                  ${sesi.status_sesi === 'completed' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
                  ${liveSessionId === sesi.id_kelompok ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : ''}
                `}
              >
                <div>
                  <h3 className="font-bold text-gray-800">{sesi.nama_kelompok}</h3>
                  <p className="text-xs text-gray-500 mt-1">{sesi.target_jumlah_pemenang} Pemenang</p>
                  
                  {/* PENANDA VISUAL "DI PANGGUNG" */}
                  {liveSessionId === sesi.id_kelompok && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">
                      DI PANGGUNG
                    </div>
                  )}
                </div>
                
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase mt-2 ${getBadgeColor(sesi.tipe_event)}`}>
                  {sesi.tipe_event}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KANAN: PREVIEW & KONTROL UTAMA */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <Card className="shadow-md border-t-4 border-t-kuning rounded-xl transition-all duration-500">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-87.5">
            {selectedSession ? (
              <>
                <Chip 
                  label={selectedSession.tipe_event.toUpperCase() + ' DRAW'} 
                  className={`mb-4 font-bold ${selectedSession.tipe_event === 'super' ? 'bg-golden text-white' : 'bg-kuning text-olive'}`} 
                />
                <h1 className="text-4xl md:text-5xl font-extrabold text-biru mb-2">
                  {selectedSession.nama_kelompok}
                </h1>
                <p className="text-xl text-gray-600 mb-8 font-medium">
                  Mengundi <span className="font-bold text-olive">{selectedSession.target_jumlah_pemenang}</span> Orang Pemenang
                </p>

                {/* WRAPPER TOMBOL AKSI */}
                <div className="flex flex-col gap-3 items-center mt-4">
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAction}
                    disabled={selectedSession.status_sesi === 'completed' || liveSessionId === selectedSession.id_kelompok}
                    startIcon={!isProjectorActive ? <PersonalVideoIcon fontSize="large" /> : <SendIcon fontSize="large" />}
                    sx={{ 
                      width: '320px',
                      backgroundColor: !isProjectorActive ? 'var(--color-biru)' : '#10b981', 
                      color: 'white',
                      padding: '12px 24px', 
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      borderRadius: '50px',
                      textTransform: 'none',
                      boxShadow: '0 10px 20px var(--color-opacity)',
                      '&:hover': { backgroundColor: !isProjectorActive ? 'var(--color-olive)' : '#059669' },
                      '&:disabled': { backgroundColor: '#ccc' }
                    }}
                  >
                    {!isProjectorActive 
                      ? 'MENUJU LAYAR PROYEKTOR' 
                      : (liveSessionId === selectedSession.id_kelompok ? 'SEDANG TAYANG' : 'TERAPKAN KE PANGGUNG')
                    }
                  </Button>

                  {/* TOMBOL TUTUP PANGGUNG (HANYA MUNCUL JIKA AKTIF) */}
                  {isProjectorActive && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={handleCloseProjector}
                      startIcon={<PowerSettingsNewIcon />}
                      sx={{ 
                        width: '280px',
                        borderRadius: '50px',
                        fontWeight: 'bold',
                        borderWidth: '2px',
                        '&:hover': { borderWidth: '2px', backgroundColor: '#fee2e2' }
                      }}
                    >
                      TUTUP PANGGUNG
                    </Button>
                  )}
                  
                </div>

                {isProjectorActive && (
                  <p className="text-sm text-green-600 font-bold mt-4 animate-pulse">
                    🟢 Layar Proyektor Terhubung
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-lg">Memuat Sesi...</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}