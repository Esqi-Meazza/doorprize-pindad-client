import { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { BACKEND_URL } from '../../../config/socket';
import AppSnackbar from '../../ui/AppSnackbar';
import useSnackbar from '../../../hooks/useSnackbar';
import AppDialog from '../../ui/AppDialog';
import ConfirmDialog from '../../common/ConfirmDialog';
import useDialog from '../../../hooks/useDialog';
import useConfirmDialog from '../../../hooks/useConfirmDialog';

import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import pindad from "../../../assets/element/pindad.webp";

export default function DoorprizeHeader() {
  const { open: isQrOpen, openDialog: openQrDialog, closeDialog: closeQrDialog } = useDialog(false);
  const { dialog, openConfirm, closeConfirm } = useConfirmDialog();
  const [userName, setUserName] = useState("User");
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.nama_lengkap) {
      setUserName(user.nama_lengkap);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.id_user) {
        throw new Error("ID user tidak ditemukan");
      }

      const response = await fetch(`${BACKEND_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_user: user.id_user,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Logout gagal");
      } localStorage.removeItem("user");
        localStorage.removeItem("hasRegistered");
        localStorage.removeItem("id_user");

      closeConfirm();

      showSnackbar({
        message: "Logout Berhasil",
      });

      // Pindah ke halaman awal
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error("Logout error:", error);
      closeConfirm();
      showSnackbar({
        message: error.message || "Logout gagal, silahkan coba lagi",
        severity: "error",
      });
    }
  };

  const confirmLogout = () => {
    openConfirm({
      title: "KONFIRMASI",
      message: "Apakah Anda Yakin Ingin Keluar?",
      confirmText: "KELUAR",
      cancelText: "KEMBALI",
      onConfirm: handleLogout,
    });
  };

  useEffect(() => {
    const hasRegistered = localStorage.getItem("hasRegistered");
    if (!hasRegistered) {
      navigate("/");
    }
  }, [navigate]); 

  return (
    <header className="h-tgh flex items-center justify-between px-4 md:px-10">

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        anchorOrigin={snackbar.anchorOrigin}
        duration={snackbar.duration}
        onClose={closeSnackbar}
      />  

      <div className="flex flex-1 justify-start">
        <img src={pindad} alt="Logo Pindad" className="object-contain h-8 md:h-12 lg:h-16" />
      </div>
      
      <div className="flex flex-1 justify-center">
        <h1 className="uppercase text-olive tracking-wide font-black text-2.5 md:text-3 lg:text-2xl">halooo {userName}!</h1>
      </div>

      <div className="flex flex-1 items-center justify-end">
        {/* Menggunakan murni MUI IconButton agar efek ripple dan padding bawaan MUI bekerja sempurna */}
        <Tooltip title="Tampilkan QR Code" placement="bottom">
          <button 
            onClick={openQrDialog}
            className="bg-white hover:bg-white-500 text-olive p-2 md:p2 mr-2 md:mr-5 smooth-transition w-5 md:w-12 lg:w-18 rounded-buled center-flex"
          >
            <CardGiftcardIcon sx={{ 
              fontSize: { 
                xs: '1.3rem',  
                sm: '2rem',    
              } 
            }}/>
          </button>
        </Tooltip>

        <Tooltip title="Keluar / Logout" placement="bottom">
          <button 
            onClick={confirmLogout}
            className="bg-kuning hover:bg-kuning-500 text-olive p-2 md:p2 smooth-transition w-5 md:w-12 lg:w-18 rounded-buled center-flex"
          >
            <LogoutIcon sx={{ 
              fontSize: { 
                xs: '1.3rem', 
                sm: '2rem',    
              } 
            }} />
          </button>
        </Tooltip>
      </div>

      <AppDialog
        open={isQrOpen}
        onClose={closeQrDialog}
        title="HUBUNGI PANITIA UNTUK SCAN QR CODE"
        maxWidth="sm"
        fullWidth
      >
        <div className="min-h-87.5 flex items-center justify-center border-t-2 border-kuning" style={{ borderTopColor: '#f1c335' }}>
          <div style={{ color: '#888', textAlign: 'center' }}>
            <CardGiftcardIcon sx={{ fontSize: 100, color: '#ccc', mb: 2 }} />
            <p>[ Area Gambar QR Code Akan Tampil Di Sini ]</p>
          </div>
        </div>
        <div className="flex justify-center p-6">
          <button
            type="button"
            onClick={closeQrDialog}
            className="bg-kuning hover:bg-yellow-500 text-olive font-black rounded-full py-2.5 px-10 smooth-transition"
          >
            Kembali
          </button>
        </div>
      </AppDialog>

      <ConfirmDialog
        open={dialog.open}
        onClose={closeConfirm}
        onConfirm={dialog.onConfirm || (() => {})}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />
    </header>
  );
}