import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import pindad from "../../../assets/element/pindad.webp";
import { BACKEND_URL } from '../../../config/socket';

export default function DoorprizeHeader() {
  const [openQr, setOpenQr] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [userName, setUserName] = useState("User");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
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
      }

      // Backend berhasil mengubah status menjadi "belum"
      localStorage.removeItem("user");
      localStorage.removeItem("hasRegistered");
      localStorage.removeItem("id_user");

      // Tutup dialog
      setOpenLogout(false);

      // Tampilkan snackbar
      setSnackbar({
        open: true,
        message: "Logout Berhasil",
        severity: "success",
      });

      // Pindah ke halaman awal
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error("Logout error:", error);

      setOpenLogout(false);

      setSnackbar({
        open: true,
        message: error.message || "Logout gagal, silakan coba lagi",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const hasRegistered = localStorage.getItem("hasRegistered");
    if (!hasRegistered) {
      navigate("/");
    }
  }, [navigate]); 

  return (
    <header className="h-tgh flex items-center justify-between px-4 md:px-10">
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '50px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
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
            onClick={() => setOpenQr(true)}
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
            onClick={() => setOpenLogout(true)}
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

      {/* DIALOG QR CODE */}
      <Dialog open={openQr} onClose={() => setOpenQr(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#08415c', textAlign: 'center' }}>HUBUNGI PANITIA UNTUK SCAN QR CODE</DialogTitle>
        <DialogContent sx={{ minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '2px solid #f1c335' }}>
          <div style={{ color: '#888', textAlign: 'center' }}>
            <CardGiftcardIcon sx={{ fontSize: 100, color: '#ccc', mb: 2 }} />
            <p>[ Area Gambar QR Code Akan Tampil Di Sini ]</p>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '1.5rem', justifyContent: 'center' }}>
          <Button onClick={() => setOpenQr(false)} variant="contained" sx={{ backgroundColor: '#f1c335', color: '#474b24', fontWeight: '900', borderRadius: '50px', padding: '10px 40px', '&:hover': { backgroundColor: '#d1a827' } }}>
            Kembali
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog logout */}
      <Dialog open={openLogout} onClose={() => setOpenLogout(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '2px solid #f1c335' }}>
          <div style={{ color: '#888', textAlign: 'center' }}>
            <p className="text-2xl"> Apakah Anda Yakin Ingin Keluar? </p>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => setOpenLogout(false)}
            className=" 
              bg-kuning hover:bg-yellow-500 smooth-transition
              text-olive font-black
              rounded-pill
              py-1 px-5.5 sm:mr-5
            ">
            KEMBALI
          </button>
          <button 
            onClick={handleLogout} 
            className="
              bg-red-600 hover:bg-red-700 smooth-transition
              text-white font-black
              rounded-pill
              py-1 px-5.5
            ">
            KELUAR
          </button>
        </DialogActions>
      </Dialog>
    </header>
  );
}