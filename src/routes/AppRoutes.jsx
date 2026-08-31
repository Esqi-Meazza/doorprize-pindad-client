import { Routes, Route } from "react-router-dom";
// peserta
import LandingPage from "../pages/public/LandingPage.jsx";
import DoorprizePage from "../pages/public/display/index.jsx";
// panitia
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

import Login from "../pages/admin/Login.jsx";
import DashboardPage from "../pages/admin/Dashboard.jsx";
import MainEventPage from "../pages/admin/MainEvent.jsx";
import ProjectorDisplay from "../pages/admin/ProjectorDisplay.jsx";
import PesertaPage from "../pages/admin/Peserta.jsx";
import PemenangPage from "../pages/admin/pemenang.jsx";
import HadiahPage from "../pages/admin/Hadiah.jsx";
import SettingPage from "../pages/admin/Setting.jsx";

function AppRoutes() {
	return (
		<Routes>
			{/* PESERTA */}
			<Route path="/" element={<LandingPage />} />
			<Route path="/doorprize" element={<DoorprizePage />} />

			{/* PANITIA */}
			<Route path="/admin" element={<Login />} />
			<Route element={<ProtectedRoute />}>
				<Route element={<AdminLayout />}>
					{/* HALAMAN PANITIA */}
					<Route path="/admin/dashboard" element={<DashboardPage />} />
					<Route path="/admin/main" element={<MainEventPage />} />
					<Route path="/admin/peserta" element={<PesertaPage />} />
					<Route path="/admin/pemenang" element={<PemenangPage />} />
					<Route path="/admin/hadiah" element={<HadiahPage />} />
					<Route path="/admin/setting" element={<SettingPage />} />
					<Route path="/admin/projector" element={<ProjectorDisplay />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default AppRoutes;
