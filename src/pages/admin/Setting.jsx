import { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
} from "@mui/material";

// Icons
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SettingsIcon from "@mui/icons-material/Settings";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Config & Hooks
import { BACKEND_URL } from "../../config/socket";
import useSnackbar from "../../hooks/useSnackbar";
import useDialog from "../../hooks/useDialog";
import { useAuth } from "../../context/AuthContext.jsx";

// Components
import AppSnackbar from "../../components/ui/AppSnackbar";
import AppDialog from "../../components/ui/AppDialog";
import AppInput from "../../components/ui/AppInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner"; // Import komponen bawaanmu

const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, 
    secondary: { main: "#b39c4d" }, 
    success: { main: "#157145" }, 
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
});

export default function SettingPage() {
  const [loading, setLoading] = useState(false);
  const [confirmKeyword, setConfirmKeyword] = useState("");
  
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const resetDialog = useDialog();
  const { authHeaders } = useAuth();
  
  const handleOpenModal = () => {
    setConfirmKeyword("");
    resetDialog.openDialog();
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/resetevent`, {
        method: "POST",
        headers: authHeaders,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal melakukan reset");

      resetDialog.closeDialog();
      showSnackbar({
        message: "Berhasil! Event telah di-reset dari nol.",
        severity: "success",
      });
    } catch (error) {
      resetDialog.closeDialog();
      showSnackbar({
        message: "Error: " + error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 }, maxWidth: "800px", mx: "auto", mt: 4 }}>
        
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <SettingsIcon fontSize="large" sx={{ color: "primary.main" }} />
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
            Pengaturan Sistem
          </Typography>
        </Box>

        {/* DANGER ZONE CARD */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            border: "2px solid rgba(211,47,47,0.3)", 
            bgcolor: "rgba(211,47,47,0.03)" 
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, color: "error.main" }}>
            <WarningAmberIcon fontSize="large" />
            <Typography variant="h5" fontWeight={800}>
              Zona Berbahaya
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3, borderColor: "rgba(211,47,47,0.1)" }} />

          <Typography variant="body1" fontWeight={600} mb={2}>
            Tindakan <strong style={{ color: "var(--color-merah)" }}>RESET EVENT</strong> akan berdampak pada:
          </Typography>
          
          <Box component="ul" sx={{ color: "text.secondary", display: "flex", flexDirection: "column", gap: 1, mb: 4, fontSize: "1.05rem" }}>
            <li><span style={{ color: "var(--color-merah)", fontWeight: "bold" }}>Menghapus</span> seluruh riwayat data pemenang secara permanen.</li>
            <li>Mengubah status <strong>seluruh peserta</strong> yang sudah menang kembali menjadi <em>"Belum Menang"</em>.</li>
            <li>Memulihkan stok sisa <strong>seluruh hadiah</strong> kembali penuh sesuai stok total awal.</li>
            <li>Me-reset status <strong>seluruh kelompok/sesi</strong> kembali ke status <em>"Pending"</em>.</li>
          </Box>

          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<RestartAltIcon />}
            onClick={handleOpenModal}
            sx={{ 
              fontWeight: 800, 
              fontSize: "1.1rem", 
              px: 4, 
              py: 1.5, 
              borderRadius: "12px",
              boxShadow: "0 10px 20px rgba(211,47,47,0.2)"
            }}
          >
            RESET EVENT SEKARANG
          </Button>
        </Paper>

        {/* MODAL KONFIRMASI KEAMANAN */}
        <AppDialog
          open={resetDialog.open}
          onClose={!loading ? resetDialog.closeDialog : undefined}
          title="Konfirmasi Reset Event"
          actions={
            !loading && (
              <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2, width: "100%" }}>
                <Button onClick={resetDialog.closeDialog} color="inherit" variant="outlined" sx={{ borderRadius: "8px", flex: 1 }}>
                  Batal
                </Button>
                <Button 
                  onClick={handleReset} 
                  color="error" 
                  variant="contained" 
                  disabled={confirmKeyword !== "RESET-EVENT"} 
                  sx={{ borderRadius: "8px", boxShadow: "none", flex: 1, fontWeight: "bold" }}
                >
                  YA, RESET SEMUA
                </Button>
              </Box>
            )
          }
        >
          {loading ? (
            <Box sx={{ py: 4 }}>
              {/* Menggunakan LoadingSpinner bawaanmu */}
              <LoadingSpinner 
                size={48} 
                direction="column" 
                message="Mereset database, mohon tunggu..." 
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
              <Typography color="error.main" fontWeight={700} fontSize="1.1rem" display="flex" alignItems="center" gap={1}>
                <WarningAmberIcon /> PERINGATAN FATAL!
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6, color: "text.secondary" }}>
                Tindakan ini tidak dapat dibatalkan. Event akan di-reset sepenuhnya ke kondisi awal (nol).
              </Typography>
              <Box sx={{ bgcolor: "rgba(8,65,92,0.05)", p: 2, borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} mb={1}>
                  Untuk melanjutkan, ketik persis <strong style={{ color: "var(--color-merah)" }}>RESET-EVENT</strong> pada kolom di bawah:
                </Typography>
                <AppInput 
                  placeholder="Ketik RESET-EVENT" 
                  value={confirmKeyword} 
                  onChange={(e) => setConfirmKeyword(e.target.value)} 
                  autoComplete="off"
                />
              </Box>
            </Box>
          )}
        </AppDialog>

        {/* SNACKBAR */}
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          duration={snackbar.duration}
          anchorOrigin={snackbar.anchorOrigin}
          onClose={closeSnackbar}
        />
      </Box>
    </ThemeProvider>
  );
}