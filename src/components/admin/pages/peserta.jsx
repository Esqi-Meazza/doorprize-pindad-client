import { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { BACKEND_URL } from "../../../config/socket.js";

// Kustomisasi Tema Material UI
const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, // Biru
    secondary: { main: "#b39c4d" }, // Golden
    success: { main: "#157145" }, // Hijau
    error: { main: "#d32f2f" }, // Merah default MUI
  },
  typography: {
    fontFamily: "inherit",
  },
});

// Styling Inline untuk Radix Dialog agar rapi tanpa file CSS
const radixOverlayStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  position: "fixed",
  inset: 0,
  zIndex: 1300,
};
const radixContentStyle = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "24px",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "450px",
  zIndex: 1400,
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
};

export default function PesertaPage() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Feedback Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // State untuk Radix Alert Dialog Hapus 1 Peserta
  const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);

  const token = localStorage.getItem("admin_token");
  const authHeader = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // FETCH DATA PESERTA
  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta`, {
        headers: authHeader,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data peserta");
      }

      setPeserta(
        data.map((row) => ({
          ...row,
          id_user: row.id_user ?? row.id,
        })),
      );
    } catch (err) {
      console.error("Gagal ambil data peserta:", err);
      showSnackbar("Gagal memuat data peserta", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // HANDLE HAPUS 1 PESERTA
  const handleDeleteSingle = async () => {
    const idUser = selectedPeserta?.id_user;
    if (idUser === undefined || idUser === null) {
      showSnackbar("ID peserta tidak ditemukan", "error");
      setDeleteSingleOpen(false);
      setSelectedPeserta(null);
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/peserta/${encodeURIComponent(idUser)}`,
        {
          method: "DELETE",
          headers: authHeader,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPeserta((currentPeserta) =>
          currentPeserta.filter(
            (row) => String(row.id_user) !== String(idUser),
          ),
        );
        showSnackbar(
          `Peserta ${selectedPeserta.nama_lengkap} berhasil dihapus`,
        );
        await fetchPeserta();
      } else {
        showSnackbar(data.error || "Gagal menghapus peserta", "error");
      }
    } catch (err) {
      showSnackbar("Terjadi kesalahan server", "error");
    } finally {
      setDeleteSingleOpen(false);
      setSelectedPeserta(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* HEADER & ACTION BUTTON */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            Daftar Peserta
          </Typography>
        </Box>
        {/* TABEL DATA PESERTA */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: { xs: 1, sm: 2 },
            border: "1px solid rgba(8,65,92,0.1)",
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
          <Table sx={{ minWidth: { xs: 500, sm: "auto" } }}>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "8%", sm: "5%" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "8%", sm: "5%" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                  }}
                >
                  NIP
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "30%", sm: "35%" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                  }}
                >
                  Nama Lengkap
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "25%", sm: "30%" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Divisi
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "20%", sm: "15%" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: { xs: "15%", sm: "15%" },
                    textAlign: "center",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                  }}
                >
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: { xs: 4, sm: 5 } }}
                  >
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : peserta.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: { xs: 4, sm: 6 } }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Belum ada peserta terdaftar.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                peserta.map((row, index) => (
                  <TableRow key={row.id_user} hover>
                    <TableCell align="center"
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" }, 
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {row.id_user}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {row.nip}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "primary.main",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {row.nama_lengkap}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                        display: { xs: "none", sm: "table-cell" },
                      }}
                    >
                      {row.nama_divisi || "-"}
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>
                      <Chip
                        label={
                          row.status_menang === "sudah"
                            ? "Sudah Menang"
                            : "Belum"
                        }
                        color={
                          row.status_menang === "sudah" ? "success" : "default"
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          height: { xs: 24, sm: 32 },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setSelectedPeserta(row);
                          setDeleteSingleOpen(true);
                        }}
                        sx={{
                          padding: { xs: 0.5, sm: 1 },
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: "1.1rem", sm: "1.5rem" },
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )} 
            </TableBody>
          </Table>
        </TableContainer>

        {/* RADIX ALERT DIALOG: HAPUS 1 PESERTA */}
        <AlertDialog.Root
          open={deleteSingleOpen}
          onOpenChange={setDeleteSingleOpen}
        >
          <AlertDialog.Portal>
            <AlertDialog.Overlay style={radixOverlayStyle} />
            <AlertDialog.Content style={radixContentStyle}>
              <AlertDialog.Title
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-biru)",
                }}
              >
                Hapus Peserta
              </AlertDialog.Title>
              <AlertDialog.Description
                style={{ margin: "16px 0", color: "#555", lineHeight: 1.5 }}
              >
                Ingin Dihapus saja peserta{" "}
                <strong>{selectedPeserta?.nama_lengkap}</strong>?
              </AlertDialog.Description>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <AlertDialog.Cancel asChild>
                  <Button variant="outlined" color="inherit">
                    Batal
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSingle}
                  >
                    Hapus
                  </Button>
                </AlertDialog.Action>
              </Box>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        {/* MUI SNACKBAR UNTUK FEEDBACK SUKSES/ERROR */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%", fontWeight: 500 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
