import { useState, useEffect } from 'react';
import { socket, BACKEND_URL } from '../../config/socket.js'; 
import useSnackbar from '../../hooks/useSnackbar.js';
import AppSnackbar from '../ui/AppSnackbar.jsx';

import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import DoorprizeBackground from './features/Background.jsx';
import DoorprizeHeader from './features/header.jsx';
import StandbyStage from './features/Standbye.jsx';
import Grid from '../common/Boxgrid.jsx'; 

export default function DoorprizePage() {
  // 1. STATE UTAMA APLIKASI
  const [appState, setAppState] = useState('LOADING'); // LOADING | ERROR | STANDBY | SPINNING | RESULT | COMPLETED
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // 2. STATE SOCKET & DATA UNDIAN
  const [sessionData, setSessionData] = useState({ mode: '', jumlah_slot: 0, title: 'DOORPRIZE' });
  const [winners, setWinners] = useState([]);
  const [participantPool, setParticipantPool] = useState([]);

  // 3. RESPONSIVE STATE
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // -- FETCH DATA AWAL --
  const fetchData = async () => {
    setAppState('LOADING');
    try {
      // Fetch pool peserta aktif
      const responsePool = await fetch(`${BACKEND_URL}/api/active`); 
      const resultPool = await responsePool.json();
      setParticipantPool(resultPool.data);
      
      // Cek Status Panggung di Backend (Sync)
      const resState = await fetch(`${BACKEND_URL}/api/spin/current`);
      const stateData = await resState.json();
      const { appState: currentAppState, sessionData: currentSession, winners: currentWinners } = stateData.data;

      if (currentAppState !== 'STANDBY' && currentSession) {
        setSessionData({
          mode: currentSession.mode,
          jumlah_slot: currentSession.jumlah_slot,
          title: currentSession.title
        });
        setWinners(currentWinners || []);
        setAppState(currentAppState);
      } else {
        setData({ title: "DOORPRIZE" });
        setAppState('STANDBY');
      }
    } catch {
      setErrorMessage("Gagal terhubung ke server backend.");
      setAppState('ERROR');
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listener untuk mendeteksi perubahan ukuran layar (Desktop vs Mobile)
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (appState === 'ERROR' && errorMessage) {
      showSnackbar({
        message: errorMessage,
        severity: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        duration: 4000,
      });
    }
  }, [appState, errorMessage, showSnackbar]);

  // -- LISTENER SOCKET.IO --
  useEffect(() => {
    socket.on('SPIN_STARTED', (data) => {
      setSessionData({
        mode: data.mode,
        jumlah_slot: data.jumlah_slot,
        title: data.title || (data.mode === 'super' ? 'SUPER PRIZE DRAW' : data.mode === 'grand' ? 'GRAND PRIZE DRAW' : 'BATCH DRAW')
      });
      setWinners([]);
      setAppState('SPINNING');
    });

    socket.on('SPIN_RESULT', (data) => {
      setWinners(data.winners);
      setAppState('RESULT');
    });

    // SINKRONISASI SESI BARU
    socket.on('SESSION_CHANGED', (newSession) => {
      setSessionData({
        mode: newSession.mode,
        jumlah_slot: newSession.jumlah_slot,
        title: newSession.title
      });
      setWinners([]);
      setAppState('STANDBY');
    });

    // JIKA ADMIN MENEKAN "TUTUP PANGGUNG", RESET TAMPILAN HP KE DEFAULT
    socket.on('STAGE_CLEARED', () => {
      setSessionData({ mode: '', jumlah_slot: 0, title: 'DOORPRIZE' });
      setWinners([]);
      setAppState('STANDBY');
    });

    socket.on('ALL_COMPLETED', () => {
      setAppState('COMPLETED');
    });

    return () => {
      socket.off('SPIN_STARTED');
      socket.off('SPIN_RESULT');
      socket.off('SESSION_CHANGED');
      socket.off('STAGE_CLEARED');
      socket.off('ALL_COMPLETED');
    };
  }, []);

  // ==========================================
  // RENDER BLOCKS
  // ==========================================

  // 1. Kondisi LOADING
  if (appState === 'LOADING') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-9999">
        <CircularProgress size={60} sx={{ color: '#f1c335' }} />
        <h2 style={{ color: '#08415c', marginTop: '1rem' }}>Menyiapkan Panggung Undian...</h2>
      </div>
    );
  }

  // 2. Kondisi ERROR
  if (appState === 'ERROR') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-9999">
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          anchorOrigin={snackbar.anchorOrigin}
          duration={snackbar.duration}
          onClose={closeSnackbar}
        />
        <h2 className="text-biru mb-4 text-2xl font-bold">Sistem Mengalami Gangguan</h2>
        <Button variant="contained" onClick={fetchData} sx={{ backgroundColor: '#08415c' }}>
          Coba Lagi (Retry)
        </Button>
      </div>
    );
  }

  // 3. Kondisi COMPLETED (Semua Sesi Selesai)
  if (appState === 'COMPLETED') {
    return (
      <div className="fixed inset-0 bg-biru flex items-center justify-center text-center p-6 z-9999">
        <h1 className="text-4xl md:text-6xl text-white font-black tracking-widest leading-tight">
          SELURUH SESI UNDIAN<br/><span className="text-kuning">TELAH SELESAI</span>
        </h1>
      </div>
    );
  }

  // 4. MAIN DISPLAY (Standby / Spinning / Result)
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden font-sans">
      <DoorprizeBackground />

      {/* Layer UI Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header menggunakan judul sesi dari Socket jika ada, atau default dari fetch */}
        <DoorprizeHeader title={appState !== 'STANDBY' ? sessionData.title : (sessionData.title || data?.title || 'DOORPRIZE')} />

        {/* Konten Utama di Tengah */}
        <div className="flex-1 w-full flex flex-col overflow-y-auto pb-10 relative z-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-golden [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {appState === 'STANDBY' && <StandbyStage />}
          
          {(appState === 'SPINNING' || appState === 'RESULT') && (
            <div className="w-full min-h-full p-4 flex flex-col items-center justify-start relative">
              
              <Grid 
                count={sessionData.jumlah_slot}
                mode={sessionData.mode}
                isSpinning={appState === 'SPINNING'}
                winners={winners}
                isDesktop={isDesktop}
                participantPool={participantPool} 
                prizeName={winners.length > 0 ? winners[0]?.nama_hadiah : "MENGACAK HADIAH..."}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}