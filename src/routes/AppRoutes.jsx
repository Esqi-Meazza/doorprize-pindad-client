import { Routes, Route } from "react-router-dom";
// peserta
import LandingPage from "../pages/public/LandingPage.jsx";
import DoorPrize from "../pages/public/Doorprize.js";
// panitia
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

import Login from "../pages/admin/Login.jsx";
import DashboardPage from "../pages/admin/pages/Dashboard.js";
import MainEventPage from "../pages/admin/pages/MainEvent.js";
import PesertaPage from "../pages/admin/pages/Peserta.js";
import HadiahPage from "../pages/admin/pages/Hadiah.js"
import SettingPage from "../pages/admin/pages/Setting.js";
import ProjectorDisplay from "../pages/admin/pages/ProjectorDisplay.js";

function AppRoutes() {
	return (
		<Routes>
			{/* PESERTA */}
			<Route path="/" element={<LandingPage />} />
			<Route path="/doorprize" element={<DoorPrize />} />

			{/* PANITIA */}
			<Route path="/admin" element={<Login />} />
			<Route element={<ProtectedRoute />}>
				<Route element={<AdminLayout />}>
					{/* HALAMAN PANITIA */}
					<Route path="/admin/dashboard" element={<DashboardPage />} />
					<Route path="/admin/main" element={<MainEventPage />} />
					<Route path="/admin/peserta" element={<PesertaPage />} />
					<Route path="/admin/hadiah" element={<HadiahPage />} />
					<Route path="/admin/setting" element={<SettingPage />} />
					<Route path="/admin/projector" element={<ProjectorDisplay />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default AppRoutes;
