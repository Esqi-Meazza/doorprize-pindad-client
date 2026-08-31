import { NavLink, Outlet, useNavigate } from "react-router-dom";
import LogoPindad from "../../assets/element/pindad.webp"; 

import DashboardIcon from "@mui/icons-material/Dashboard";
import StarsIcon from '@mui/icons-material/Stars';
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from "@mui/icons-material/Logout";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* SIDEBAR */}
      <aside className="
        flex flex-col
        bg-biru text-white 
        transition-all duration-300 ease-out
        w-18 lg:w-48
      ">

        <div className="
          py-4 lg:px-5 lg:py-6
          flex
          justify-center lg:items-center
          gap-3
          border-b-2 border-b-golden
        ">
        <img src={LogoPindad} alt="Logo Pindad" className="w-9 h-auto" />
          <div className="
          sidebar-title 
          text-5 font-black tracking-wide 
          hidden lg:block
          ">
          DOORPRIZE </div>
        </div>

        <nav className="
          flex flex-1 flex-col
          py-5 px-0
        ">
          <NavLink
            to="/admin/dashboard" 
            className="
              nav-item
              flex
              items-center
              text-white
              font-semibold
            " 
            end>
            <DashboardIcon />
            <span className="hidden lg:block">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/main" 
              className="
                nav-item
              ">
            <StarsIcon />
            <span className="hidden lg:block">Main Event</span>
          </NavLink>
          
          <NavLink to="/admin/peserta" className="nav-item">
            <PeopleIcon />
            <span className="hidden lg:block">Peserta</span>
          </NavLink>

          <NavLink to="/admin/pemenang" className="nav-item">
            <EmojiEventsIcon />
            <span className="hidden lg:block">Pemenang</span>
          </NavLink>
          
          <NavLink to="/admin/hadiah" className="nav-item">
            <CardGiftcardIcon />
            <span className="hidden lg:block">Doorprize</span>
          </NavLink>
          
          <NavLink to="/admin/setting" className="nav-item">
            <SettingsIcon />
            <span className="hidden lg:block">Setting</span>
          </NavLink>
        </nav>

        <div className="border-t-golden border-t-2 p-5">
          <button 
            onClick={handleLogout} 
            className="
              w-full flex
              items-center justify-center
              gap-2
              p-2.5 lg:p-3
              bg-transparent
              text-white text-4 font-semibold font-inherit
              rounded-lg
              border-0 lg:border-2 lg:border-golden
              cursor-pointer
              transition-all duration-300 ease-in-out 
              hover:bg-opacity hover:text-golden
            ">
            <LogoutIcon />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* KONTEN HALAMAN (Berubah-ubah sesuai menu yang diklik) */}
      <main className="flex-1 p-5 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}