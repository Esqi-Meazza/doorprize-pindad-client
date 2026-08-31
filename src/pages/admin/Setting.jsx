import { useState } from 'react';
import { BACKEND_URL } from '../../config/socket.js';
import AppSnackbar from '../../components/ui/AppSnackbar.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';
import useConfirmDialog from '../../hooks/useConfirmDialog.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';

export default function SettingPage() {
  const [loading, setLoading] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { dialog, openConfirm, closeConfirm } = useConfirmDialog();
  const token = localStorage.getItem("admin_token");
  
  const authHeader = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/resetevent`, {
        method: 'POST',
        headers: authHeader
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Gagal melakukan reset');

      closeConfirm();
      showSnackbar({
        message: 'Berhasil! Event telah di-reset dari nol.',
        severity: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } catch (error) {
      closeConfirm();
      showSnackbar({
        message: 'Error: ' + error.message,
        severity: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = () => {
    openConfirm({
      title: 'PERINGATAN',
      message: 'Apakah Anda yakin ingin mereset seluruh event? Semua data pemenang akan dihapus!',
      confirmText: 'YA RESET',
      cancelText: 'BATAL',
      onConfirm: handleReset,
    });
  };

  return (
    <div className="h-full w-full center-flex flex-col flex-1">
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        anchorOrigin={snackbar.anchorOrigin}
        duration={snackbar.duration}
        onClose={closeSnackbar}
      />

      <ConfirmDialog
        open={dialog.open}
        onClose={closeConfirm}
        onConfirm={dialog.onConfirm || (() => {})}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />

      <h2 className="text-biru font-black mb-5 text-5xl">Reset Event?</h2>
      <button 
        onClick={confirmReset}
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