import { Routes, Route } from "react-router-dom";
// peserta
import LandingPage from "../components/public/LandingPage.jsx";
import DoorPrize from "../components/public/Doorprize.jsx";
// panitia
import ProtectedRoute from "./ProtectedRoute.jsx";
import Login from "../components/admin/Login.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import DashboardPage from "../components/admin/pages/Dashboard.jsx";
import MainEventPage from "../components/admin/pages/MainEvent.jsx";
import PesertaPage from "../components/admin/pages/Peserta.jsx";
import HadiahPage from "../components/admin/pages/Hadiah.jsx"
import SettingPage from "../components/admin/pages/Setting.jsx";
import ProjectorDisplay from "../components/admin/pages/ProjectorDisplay.jsx";

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
