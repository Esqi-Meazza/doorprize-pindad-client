import { useState, useEffect, useRef } from 'react';
import DynamicSlotGrid from '../../common/Boxgrid'; 
import soundUrl from '../../../assets/audio/Sound.mp3';
import winSoundUrl from '../../../assets/audio/win.mp3';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { socket, BACKEND_URL } from '../../../config/socket'; 

export default function ProjectorDisplay() {
  const [appState, setAppState] = useState('STANDBY'); // STANDBY | SPINNING | RESULT
  
  // Mencegah "Memuat sesi..." berkedip dengan membaca localStorage langsung di awal
  const [sessionData, setSessionData] = useState(() => {
    const storedSession = localStorage.getItem('active_projector_session');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      return {
        id_kelompok: parsed.id_kelompok,
        jumlah_slot: parsed.target_jumlah_pemenang,
        title: parsed.nama_kelompok,
        mode: parsed.tipe_event
      };
    }
    return null;
  });

  const [winners, setWinners] = useState([]);
  const [participantPool, setParticipantPool] = useState([]);
  const spinAudioRef = useRef(null);
  const winAudioRef = useRef(null);

  useEffect(() => {
    spinAudioRef.current = new Audio(soundUrl);
    spinAudioRef.current.preload = 'auto';
    spinAudioRef.current.loop = true;
    
    winAudioRef.current = new Audio(winSoundUrl);
    winAudioRef.current.preload = 'auto';
    
    spinAudioRef.current.load();
    winAudioRef.current.load();

    return () => {
      spinAudioRef.current?.pause();
      winAudioRef.current?.pause();
    };
  }, []);

  // 1. INIT DATA SAAT COMPONENT MOUNT & SINKRONISASI REFRESH
  useEffect(() => {
    if (!sessionData) {
      alert("Sesi tidak ditemukan! Harap buka dari panel Admin.");
    }

    const fetchInitialData = async () => {
      try {
        const resPool = await fetch(`${BACKEND_URL}/api/active`);
        if (!resPool.ok) throw new Error(`Pool peserta gagal: HTTP ${resPool.status}`);
        const poolData = await resPool.json();
        setParticipantPool(poolData.data || []);
      } catch (err) {
        console.warn("Pool peserta tidak tersedia", err);
      }

      try {
        const resState = await fetch(`${BACKEND_URL}/api/spin/current`);
        if (!resState.ok) throw new Error(`Status spin gagal: HTTP ${resState.status}`);
        const stateData = await resState.json();
        const { appState: currentAppState, sessionData: currentSession, winners: currentWinners } = stateData.data;

        if (currentAppState !== 'STANDBY' && currentSession) {
          setSessionData({
            id_kelompok: currentSession.id_kelompok,
            jumlah_slot: currentSession.jumlah_slot,
            title: currentSession.title,
            mode: currentSession.mode
          });
          setWinners(currentWinners || []);
          setAppState(currentAppState);
        }
      } catch (err) {
        console.warn("Sinkronisasi status spin tidak tersedia", err);
      }
    };
    fetchInitialData();
  }, []); 

  // 2. SOCKET LISTENERS (Sinkronisasi Visual)
  useEffect(() => {
    socket.on('SPIN_STARTED', () => {
      setWinners([]); 
      setAppState('SPINNING');
      if (spinAudioRef.current) {
          spinAudioRef.current.currentTime = 0;
          spinAudioRef.current.play().catch(e => console.log('Audio spin gagal diputar:', e));
      }
    });

    socket.on('SPIN_RESULT', (data) => {
      setWinners(data.winners);
      setAppState('RESULT');
      
      if (spinAudioRef.current) {
        spinAudioRef.current.pause();
        spinAudioRef.current.currentTime = 0;
      }
      
    });

    // TANGKAP PERUBAHAN SESI (Auto-Next atau dari Admin)
    socket.on('SESSION_CHANGED', (newSession) => {
      setSessionData({
        id_kelompok: newSession.id_kelompok,
        jumlah_slot: newSession.jumlah_slot,
        title: newSession.title,
        mode: newSession.mode
      });
      setWinners([]);
      setAppState('STANDBY');

      // Update LocalStorage agar aman jika direfresh
      localStorage.setItem('active_projector_session', JSON.stringify({
        id_kelompok: newSession.id_kelompok,
        target_jumlah_pemenang: newSession.jumlah_slot,
        nama_kelompok: newSession.title,
        tipe_event: newSession.mode
      }));
    });

    // JIKA ADMIN MENEKAN "TUTUP PANGGUNG", TAB INI OTOMATIS TERTUTUP
    socket.on('STAGE_CLEARED', () => {
      window.close();
    });

    // JIKA SELURUH SESI SELESAI
    socket.on('ALL_COMPLETED', () => {
      alert("Seluruh Sesi Undian Telah Selesai!");
      setSessionData(null); 
    });

    return () => {
      socket.off('SPIN_STARTED');
      socket.off('SPIN_RESULT');
      socket.off('SESSION_CHANGED');
      socket.off('STAGE_CLEARED');
      socket.off('ALL_COMPLETED');
    };
  }, []);

  // 3. SHORTCUT KEYBOARD (Ctrl + Q)
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        const isConfirm = window.confirm("Tutup layar proyektor dan kembali ke mode awal?");
        if (!isConfirm) return;

        try {
          await fetch(`${BACKEND_URL}/api/spin/clear`, { method: 'POST' });
          window.close(); // Tab otomatis menutup sendiri
        } catch (error) {
          console.error("Gagal menutup panggung via shortcut:", error);
          alert("Gagal memproses shortcut tutup panggung.");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================
  // FUNGSI KONTROL TOMBOL (API CALLS)
  // ==========================================
  
  const handleStart = async () => {
    if (spinAudioRef.current) {
      try {
        await spinAudioRef.current.play();
      } catch (error) {
        console.warn('Audio belum dapat diaktifkan:', error);
      }
    }

    await fetch(`${BACKEND_URL}/api/spin/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_kelompok: sessionData.id_kelompok,
        nama_kelompok: sessionData.title,
        jumlah_slot: sessionData.jumlah_slot,
        mode: sessionData.mode
      })
    });
  };

  const handleStop = async () => {
    if (spinAudioRef.current) {
      spinAudioRef.current.pause();
      spinAudioRef.current.currentTime = 0;
    }

    if (winAudioRef.current) {
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play().catch(e => console.log('Audio pemenang gagal diputar:', e));
    }

    await fetch(`${BACKEND_URL}/api/spin/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_kelompok: sessionData.id_kelompok })
    });
  };

  const handleRespin = async () => {
    const isConfirm = window.confirm("Batal dan acak ulang sesi ini?");
    if (!isConfirm) return;

    if (spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(e => console.log('Audio spin gagal diputar:', e));
    }

    await fetch(`${BACKEND_URL}/api/spin/respin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_kelompok: sessionData.id_kelompok,
        nama_kelompok: sessionData.title,
        jumlah_slot: sessionData.jumlah_slot
      })
    });
  };

  // EKSEKUSI API AUTO-NEXT KE SESI SELANJUTNYA
  const handleNext = async () => {
    if (!sessionData?.id_kelompok) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/spin/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_kelompok: sessionData.id_kelompok })
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Gagal melompat ke sesi selanjutnya:", error);
      alert(`Gagal pindah sesi: ${error.message}`);
    }
  };

  if (!sessionData) return <div className="p-10 text-xl font-bold text-center mt-20 text-red-600">Sesi tidak valid. Silakan buka dari halaman Admin.</div>;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden font-sans">
      
      <div className="relative z-10 w-full h-full flex flex-col pb-24"> 
        <main className="grow flex flex-col items-center justify-center p-8 overflow-y-auto">
          
          {appState === 'STANDBY' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="text-center animate-pulse bg-white/90 p-12 rounded-2xl shadow-[0_10px_30px_var(--color-opacity)] border-4 border-kuning">
                <h2 className="text-[clamp(40px,5vw,70px)] text-biru font-black mb-2">PENGUNDIAN DOORPRIZE</h2>
                <h3 className="text-[clamp(30px,4vw,50px)] text-olive font-bold mb-6">PT. PINDAD (PERSERO)</h3>
                <p className="text-[clamp(24px,2.5vw,36px)] text-golden font-extrabold tracking-[5px] uppercase">
                  {sessionData.title}
                </p>
              </div>
            </div>
          )}

          {(appState === 'SPINNING' || appState === 'RESULT') && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <DynamicSlotGrid 
                count={sessionData.jumlah_slot}
                mode={sessionData.mode} 
                isDesktop={true}                
                isSpinning={appState === 'SPINNING'}
                winners={winners}
                participantPool={participantPool}
                prizeName={winners.length > 0 ? winners[0]?.nama_hadiah : "MENGACAK HADIAH..."}
              />
            </div>
          )}
        </main>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-biru/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border-2 border-white/20 transition-opacity hover:opacity-100 opacity-30">
        
        {appState === 'STANDBY' && (
          <button onClick={handleStart} className="flex items-center gap-2 px-8 py-3 bg-kuning text-olive font-black rounded-full hover:bg-yellow-400 transition-transform hover:scale-105">
            <PlayArrowIcon fontSize='large'/> MULAI SPIN
          </button>
        )}

        {appState === 'SPINNING' && (
          <button onClick={handleStop} className="flex items-center gap-2 px-10 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-700 transition-transform hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse">
            <StopIcon fontSize='large'/> STOP DRAW
          </button>
        )}

        {appState === 'RESULT' && (
          <>
            <button onClick={handleRespin} className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-700 transition-transform hover:scale-105">
              <ReplayIcon /> RESPIN (BATAL)
            </button>
            
            <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-olive text-white font-black rounded-full hover:bg-green-700 transition-transform hover:scale-105">
              SESI SELANJUTNYA <SkipNextIcon fontSize='large'/>
            </button>
          </>
        )}

      </div>
    </div>
  );
}