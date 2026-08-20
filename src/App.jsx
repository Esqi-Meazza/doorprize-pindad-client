import { BrowserRouter, Routes, Route } from "react-router-dom";
// peserta
import LandingPage from "./components/public/landingPage.jsx";
import DoorPrize from "./components/public/doorprize.jsx";
import Grit from "./components/public/features/boxgrid.jsx"
// panitia 
import Login from "./components/admin/login.jsx";
import DashboardAdmin from "./components/admin/dashboardAdmin.jsx";
import ProtectedRoute from "./components/admin/protectedRoute.jsx";
import AdminLayout from "./components/admin/dashboardAdmin.jsx";
import DashboardPage from "./components/admin/pages/dashboard.jsx";
import MainEventPage from "./components/admin/pages/mainEvent.jsx";
import PesertaPage from "./components/admin/pages/peserta.jsx";
import DoorprizePage from "./components/admin/pages/doorprize.jsx";
import SettingPage from "./components/admin/pages/setting.jsx";
import ProjectorDisplay from "./components/admin/pages/projectorDisplay.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PESERTA */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/doorprize" element={<DoorPrize />} />
        <Route path="/grid" element={<Grit />} />

        {/* PANITIA */}
        <Route path="/admin" element={<Login />} />
        <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* HALAMAN PANITIA */}
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/main" element={<MainEventPage />} />
          <Route path="/admin/peserta" element={<PesertaPage />} />
          <Route path="/admin/doorprize" element={<DoorprizePage />} />
          <Route path="/admin/setting" element={<SettingPage />} />
          <Route path="/admin/projector" element={<ProjectorDisplay />} />

        </Route>
      </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;