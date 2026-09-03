import { useEffect, useState, useCallback } from "react";
import { BACKEND_URL } from "../../config/socket.js";
import useLoading from "../../hooks/useLoading.js";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton.jsx";
import AppSnackbar from "../../components/ui/AppSnackbar.jsx";
import useSnackbar from "../../hooks/useSnackbar.js";
import { useAuth } from "../../context/AuthContext.jsx";

// MUI Icons & Component
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import CircularProgress from "@mui/material/CircularProgress";

export default function Dashboard() {
  const { isLoading, withLoading } = useLoading(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const { authHeaders } = useAuth();
  
  const [stats, setStats] = useState({
    totalPeserta: 0,
    totalPemenang: 0,
    totalHadiahTersedia: 0,
    hadiahTerundi: 0,
    persentaseSelesai: 0,
    sesiAktif: null,
  });
  const [winners, setWinners] = useState([]);

  // Fungsi Fetch Paralel
  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, winnersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/stats`, { headers: authHeaders }),
        fetch(`${BACKEND_URL}/api/admin/winners/latest`, { headers: authHeaders }),
      ]);

      const statsJson = await statsRes.json();
      const winnersJson = await winnersRes.json();

      // Karena BE baru mereturn { success: true, data: ... }
      if (statsJson.success) setStats(statsJson.data);
      if (winnersJson.success) setWinners(winnersJson.data);
    } catch (err) {
      console.error("Gagal load data dashboard:", err);
      showSnackbar({
        message: "Gagal load data dashboard" || err,
        severity: "error",
        duration: 4000
      })
    }
  }, [authHeaders, showSnackbar]);

  // Inisialisasi awal dengan Skeleton Loading
  useEffect(() => {
    withLoading(fetchDashboardData);

    // Sementara pakai interval (Short Polling) sampai Socket.io tahap lanjut siap
    const intervalId = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(intervalId);
  }, [withLoading, fetchDashboardData]);

  // Komponen Reusable Card Kecil (Internal)
  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-lg ${colorClass} text-white shrink-0`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-500">{title}</span>
        <span className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight mt-1">
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        anchorOrigin={snackbar.anchorOrigin}
        duration={snackbar.duration}
        onClose={closeSnackbar}
        sx={{
          width: 'auto'
        }}
      />
      {/* Header Dashboard */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-biru tracking-wide">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan status doorprize realtime
        </p>
      </div>

      {isLoading ? (
        // Tampilan saat pertama kali dimuat
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <>
          {/* GRID 1 - 4: Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatCard
              title="Total Peserta"
              value={stats.totalPeserta}
              icon={<PeopleIcon fontSize="large" />}
              colorClass="bg-biru"
            />
            <StatCard
              title="Total Hadiah"
              value={stats.totalHadiahTersedia}
              icon={<CardGiftcardIcon fontSize="large" />}
              colorClass="bg-golden"
            />
            <StatCard
              title="Hadiah Diundi"
              value={stats.hadiahTerundi}
              icon={<CheckCircleIcon fontSize="large" />}
              colorClass="bg-biru"
            />
            <StatCard
              title="Total Pemenang Sah"
              value={stats.totalPemenang}
              icon={<EmojiEventsIcon fontSize="large" />}
              colorClass="bg-golden"
            />
          </div>

          {/* GRID 5: Sesi & Progress Acara */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5.1 Persentase Selesai */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="relative inline-flex shrink-0">
                <CircularProgress
                  variant="determinate"
                  value={stats.persentaseSelesai}
                  size={90}
                  thickness={4}
                  sx={{ color: "var(--color-biru)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {stats.persentaseSelesai}%
                  </span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-800">Progress Acara</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <b>{stats.hadiahTerundi}</b> dari <b>{stats.totalHadiahTersedia}</b> total hadiah telah berhasil diundi.
                </p>
              </div>
            </div>

            {/* 5.2 Sesi Undian Aktif */}
            <div className="bg-biru p-6 rounded-xl shadow-sm flex items-center justify-between text-white relative overflow-hidden">
              {/* Efek Lingkaran Abstrak di Background */}
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="z-10">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                  Sesi Aktif Saat Ini
                </h3>
                <p className="text-2xl font-bold text-golden mt-2">
                  {stats.sesiAktif
                    ? stats.sesiAktif.nama_sesi || stats.sesiAktif.nama_kelompok
                    : "Tidak Ada Sesi Berjalan"}
                </p>
              </div>
              <PlayCircleFilledIcon
                sx={{ fontSize: 60, color: "var(--color-golden)" }}
                className={stats.sesiAktif ? "animate-pulse" : "opacity-50"}
              />
            </div>
          </div>

          {/* GRID 6: Live Winner Logs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
            <div className="bg-gray-50 p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-biru flex items-center gap-2">
                <EmojiEventsIcon sx={{ color: "var(--color-golden)" }} />
                Live Pemenang Terbaru
              </h2>
            </div>
            <div className="p-4 sm:p-6 max-h-100 overflow-y-auto custom-scrollbar">
              {winners.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-medium">
                  Belum ada data pemenang yang tercatat.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {winners.map((w, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border-l-4 border-hijau hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-hijau/20 flex items-center justify-center font-bold text-hijau shrink-0">
                        #{index + 1}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-biru truncate">
                          {w.nama_lengkap}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Memenangkan: <span className="font-semibold text-golden">{w.nama_hadiah}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}