import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LogoPindad from "../assets/element/pindad.webp"; 
import useConfirmDialog from "../hooks/useConfirmDialog";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useAuth } from "../context/AuthContext.jsx";

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from "@mui/icons-material/Dashboard";
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from "@mui/icons-material/Logout";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { dialog, openConfirm, closeConfirm } = useConfirmDialog();
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

    const confirmLogout = () => {
    openConfirm({
      title: "KONFIRMASI",
      message: "Apakah Anda Yakin Ingin Keluar?",
      confirmText: "YA, KELUAR",
      cancelText: "BATAL",
      onConfirm: handleLogout,
    });
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* TOMBOL BUKA SIDEBAR (Melayang di kiri atas) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-40 p-2.5 bg-biru text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300"
        >
          <MenuIcon />
        </button>
      )}

      {/* BACKDROP OVERLAY (Latar gelap saat sidebar terbuka) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR OVERLAY */}
      <aside className={`
        fixed top-0 left-0 h-full z-50
        flex flex-col bg-biru text-white shadow-2xl
        transition-transform duration-300 ease-in-out
        w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* HEADER SIDEBAR */}
        <div className="flex items-center justify-between p-5 border-b-2 border-b-golden">
          <div className="flex items-center gap-3">
            <img src={LogoPindad} alt="Logo Pindad" className="w-8 h-auto" />
            <div className="text-xl font-black tracking-widest">DOORPRIZE</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-white hover:text-golden transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* MENU NAVIGASI (Memakai @utility nav-item) */}
        <nav className="flex flex-1 flex-col py-5 px-0 overflow-y-auto">
          <NavLink to="/admin/dashboard" onClick={handleMenuClick} end className="nav-item">
            <DashboardIcon /> <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/main" onClick={handleMenuClick} className="nav-item">
            <StarsIcon /> <span>Main Event</span>
          </NavLink>
          
          <NavLink to="/admin/peserta" onClick={handleMenuClick} className="nav-item">
            <PeopleIcon /> <span>Peserta</span>
          </NavLink>

          <NavLink to="/admin/pemenang" onClick={handleMenuClick} className="nav-item">
            <EmojiEventsIcon /> <span>Pemenang</span>
          </NavLink>

          <NavLink to="/admin/hadiah" onClick={handleMenuClick} className="nav-item">
            <CardGiftcardIcon /> <span>Doorprize</span>
          </NavLink>

          <NavLink to="/admin/kelompok" onClick={handleMenuClick} className="nav-item">
            <FolderIcon /> <span>Kelompok Hadiah</span>
          </NavLink>

          <NavLink to="/admin/setting" onClick={handleMenuClick} className="nav-item">
            <SettingsIcon /> <span>Setting</span>
          </NavLink>
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-5 border-t-2 border-t-golden">
          <button 
            onClick={confirmLogout} 
            className="
              w-full flex items-center justify-center gap-2 p-3
              bg-transparent text-white font-bold rounded-lg
              border-2 border-golden cursor-pointer
              transition-all duration-300 ease-in-out 
              hover:bg-opacity hover:text-golden
            "
          >
            <LogoutIcon /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={dialog.open}
        onClose={closeConfirm}
        onConfirm={dialog.onConfirm || (() => {})}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
      />

      {/* KONTEN HALAMAN UTAMA */}
      <main className="flex-1 w-full h-full overflow-y-auto py-2 md:py-4 pl-9 md:pl-18 pr-4">
        <Outlet />
      </main>
      
    </div>
  );
}