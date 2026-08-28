import { Routes, Route } from "react-router-dom";
// peserta
import LandingPage from "../components/public/LandingPage.jsx";
import DoorPrize from "../components/public/Doorprize.jsx";
// universal
import Grid from "../components/Boxgrid.jsx";
// panitia
import ProtectedRoute from "./ProtectedRoute.jsx";
import Login from "../components/admin/Login.jsx";
import AdminLayout from "../components/admin/DashboardAdmin.jsx";
import DashboardPage from "../components/admin/pages/Dashboard.jsx";
import MainEventPage from "../components/admin/pages/MainEvent.jsx";
import PesertaPage from "../components/admin/pages/Peserta.jsx";
import DoorprizePage from "../components/admin/pages/Doorprize.jsx";
import SettingPage from "../components/admin/pages/Setting.jsx";
import ProjectorDisplay from "../components/admin/pages/ProjectorDisplay.jsx";

function AppRoutes() {
	return (
		<Routes>
			{/* PESERTA */}
			<Route path="/" element={<LandingPage />} />
			<Route path="/doorprize" element={<DoorPrize />} />
			<Route path="/grid" element={<Grid />} />

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
	);
}

export default AppRoutes;
