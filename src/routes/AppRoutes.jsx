import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
// panitia
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";


const LandingPage = lazy(() => import("../pages/public/LandingPage.jsx"));
const DoorprizePage = lazy(() => import("../pages/public/display/index.jsx"));
const Login = lazy(() => import("../pages/admin/Login.jsx"));
const DashboardPage = lazy(() => import("../pages/admin/Dashboard.jsx"));
const MainEventPage = lazy(() => import("../pages/admin/MainEvent.jsx"));
const ProjectorDisplay = lazy(() => import("../pages/admin/ProjectorDisplay.jsx"));
const PesertaPage = lazy(() => import("../pages/admin/Peserta.jsx"));
const PemenangPage = lazy(() => import("../pages/admin/Pemenang.jsx"));
const HadiahPage = lazy(() => import("../pages/admin/Hadiah.jsx"));
const KelompokHadiahPage = lazy(() => import("../pages/admin/KelompokHadiah.jsx"));
const SettingPage = lazy(() => import("../pages/admin/Setting.jsx"));

function AppRoutes() {
	return (
		<Routes>
			{/* PESERTA */}
			<Route path="/" element={<LandingPage />} />
			<Route path="/doorprize" element={<DoorprizePage />} />

			{/* PANITIA */}
			<Route path="/admin" element={<Login />} />
			<Route element={<ProtectedRoute />}>
				<Route path="/admin/projector" element={<ProjectorDisplay />} />
				<Route element={<AdminLayout />}>
					{/* HALAMAN PANITIA */}
					<Route path="/admin/dashboard" element={<DashboardPage />} />
					<Route path="/admin/main" element={<MainEventPage />} />
					<Route path="/admin/peserta" element={<PesertaPage />} />
					<Route path="/admin/pemenang" element={<PemenangPage />} />
					<Route path="/admin/hadiah" element={<HadiahPage />} />
					<Route path="/admin/kelompok" element={<KelompokHadiahPage />} />
					<Route path="/admin/setting" element={<SettingPage />} />
				</Route>
			</Route>
		</Routes>
	);
}

export default AppRoutes;
