import { useState, useEffect, useCallback } from "react";
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
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Config & Hooks (Sesuaikan Path)
import { BACKEND_URL } from "../../config/socket";
import useSnackbar from "../../hooks/useSnackbar";
import useDialog from "../../hooks/useDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";

// Reusable Components
import AppSnackbar from "../../components/ui/AppSnackbar";
import AppDialog from "../../components/ui/AppDialog";
import AppInput from "../../components/ui/AppInput";
import AppDatePicker from "../../components/ui/AppDatePicker";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";

const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, // Biru
    secondary: { main: "#b39c4d" }, // Golden
    success: { main: "#157145" }, // Hijau
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
});

// Template State Awal Form Tambah
const DEFAULT_ADD_FORM = { 
  nip: "", 
  nama_lengkap: "", 
  id_divisi: "",
  tgl_lahir: { day: "01", month: "Jan", year: "2000", date: "2000-01-01" }
};

export default function PesertaPage() {
  // Hooks Reusable
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const addDialog = useDialog();
  const resetAllDialog = useDialog();
  const { dialog: confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();

  // State Data & Pagination
  const [peserta, setPeserta] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Filter & Navigasi
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("");

  // State Form & Konfirmasi
  const [addForm, setAddForm] = useState(DEFAULT_ADD_FORM);
  const [confirmKeyword, setConfirmKeyword] = useState("");

  const token = localStorage.getItem("admin_token");

  // ================= FETCH DATA ================= //
  const fetchDivisi = useCallback(async () => {
    try {
      const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${BACKEND_URL}/api/admin/divisi`, { headers: authHeader });
      const json = await res.json();
      if (json.success) setDivisiList(json.data);
    } catch (err) {
      console.error("Gagal load divisi:", err);
    }
  }, [token]);

  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const query = new URLSearchParams({ page, limit, search: activeSearch, divisi: selectedDivisi }).toString();
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta-paged?${query}`, { headers: authHeader });
      const json = await res.json();

      if (json.success) {
        setPeserta(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Gagal memuat data peserta", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeSearch, selectedDivisi, showSnackbar, token]);

  useEffect(() => { fetchDivisi(); }, [fetchDivisi]);
  useEffect(() => { fetchPeserta(); }, [fetchPeserta]);

  // ================= HANDLER FILTER ================= //
  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      setActiveSearch(searchInput);
      setPage(1);
    }
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setActiveSearch("");
    setSelectedDivisi("");
    setPage(1);
  };

  // ================= HANDLER ACTION 2.2 ================= //
  
  // 1. TAMBAH PESERTA
  const handleOpenAddModal = () => {
    setAddForm(DEFAULT_ADD_FORM);
    addDialog.openDialog();
  };

  const handleSubmitAdd = async () => {
    if (!addForm.nip || !addForm.nama_lengkap || !addForm.id_divisi) {
      showSnackbar({ message: "Field NIP, Nama Lengkap, dan Divisi wajib diisi!", severity: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nip: addForm.nip,
        nama_lengkap: addForm.nama_lengkap,
        id_divisi: addForm.id_divisi,
        tgl_lahir: addForm.tgl_lahir?.date || null // Extract date string for backend
      };

      const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        showSnackbar({ message: json.message, severity: "success" });
        addDialog.closeDialog();
        fetchPeserta();
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. RESET SEMUA PESERTA
  const handleOpenResetAllModal = () => {
    setConfirmKeyword("");
    resetAllDialog.openDialog();
  };

  const handleResetAll = async () => {
    setIsSubmitting(true);
    try {
      const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta/reset-all`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ confirm_keyword: confirmKeyword }),
      });
      const json = await res.json();

      if (json.success) {
        showSnackbar({ message: json.message, severity: "success" });
        resetAllDialog.closeDialog();
        setPage(1);
        fetchPeserta();
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. HAPUS SINGLE PESERTA
  const handleDeleteSingle = (row) => {
    openConfirm({
      title: "Hapus Peserta",
      message: `Apakah Anda yakin ingin menghapus peserta ${row.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
          const res = await fetch(`${BACKEND_URL}/api/admin/peserta/${row.id_user}`, {
            method: "DELETE",
            headers: authHeader,
          });
          const json = await res.json();

          if (json.success) {
            showSnackbar({ message: json.message, severity: "success" });
            fetchPeserta();
          } else {
            showSnackbar({ message: json.error, severity: "error" });
          }
        } catch (err) {
          showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
        }
      }
    });
  };

  const handleView = (row) => console.log("Lihat Detail:", row);
  const handleEdit = (row) => console.log("Edit Peserta:", row);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 } }}>
        
        {/* HEADER & ACTION BUTTONS */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
            Data Peserta
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<WarningAmberIcon />}
              onClick={handleOpenResetAllModal}
              sx={{ fontWeight: "bold", borderRadius: "8px" }}
            >
              Hapus Semua
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddModal}
              sx={{ fontWeight: "bold", borderRadius: "8px", boxShadow: "none" }}
            >
              Tambah Peserta
            </Button>
          </Box>
        </Box>

        {/* FILTER BAR */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Cari NIP atau Nama..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.secondary" }} /></InputAdornment> } }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch} sx={{ borderRadius: "8px" }}>Cari</Button>
          
          <Select
            size="small"
            displayEmpty
            value={selectedDivisi}
            onChange={(e) => { setSelectedDivisi(e.target.value); setPage(1); }}
            sx={{ flex: { xs: "1 1 100%", md: "0 1 250px" }, borderRadius: "8px" }}
          >
            <MenuItem value=""><em>Semua Divisi</em></MenuItem>
            {divisiList.map((div) => (
              <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>
            ))}
          </Select>

          <Button variant="text" color="inherit" startIcon={<RestartAltIcon />} onClick={handleResetFilter} sx={{ color: "text.secondary", fontWeight: 600 }}>
            Reset
          </Button>
        </Paper>

        {/* TABEL DATA PESERTA */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", minHeight: "400px" }}>
          {loading ? (
            <div className="p-4"><LoadingSkeleton variant="table" count={5} /></div>
          ) : (
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "5%", py: 2, textAlign: "center" }}>NO</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2 }}>NIP</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "25%", py: 2 }}>Nama Lengkap</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2 }}>Divisi</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2, textAlign: "center" }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peserta.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" sx={{ color: "text.secondary" }}>Belum ada peserta yang ditemukan.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  peserta.map((row, index) => (
                    <TableRow key={row.id_user} hover>
                      <TableCell align="center">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>{row.nip}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>{row.nama_lengkap}</TableCell>
                      <TableCell>{row.nama_divisi || "-"}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center" }}>
                          <Chip 
                            label={row.status_menang === "sudah" ? "Sudah Menang" : "Belum Menang"} 
                            color={row.status_menang === "sudah" ? "success" : "default"} 
                            size="small" 
                            sx={{ fontSize: "0.7rem", fontWeight: "bold", height: 20 }} 
                          />
                          <Typography 
                            variant="caption" 
                            sx={{ fontSize: "0.65rem", fontWeight: 700, color: row.status_terdaftar === "sudah" ? "primary.main" : "error.main" }}
                          >
                            {row.status_terdaftar === "sudah" ? "Terdaftar" : "Belum Terdaftar"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton size="small" color="primary" onClick={() => handleView(row)} sx={{ bgcolor: "rgba(8,65,92,0.1)" }}><VisibilityIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="secondary" onClick={() => handleEdit(row)} sx={{ bgcolor: "rgba(179,156,77,0.1)" }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteSingle(row)} sx={{ bgcolor: "rgba(211,47,47,0.1)" }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* FOOTER PAGINATION */}
        {!loading && totalItems > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 1, px: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Tampilkan:</Typography>
              <Select
                size="small"
                value={limit}
                onChange={(e) => { setLimit(e.target.value); setPage(1); }}
                sx={{ borderRadius: "8px", height: "35px" }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" size="small" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} sx={{ minWidth: "40px", p: 1, borderRadius: "8px" }}><ArrowBackIosNewIcon fontSize="small" /></Button>
              <Typography variant="body2" fontWeight="bold">{page}</Typography>
              <Button variant="outlined" size="small" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} sx={{ minWidth: "40px", p: 1, borderRadius: "8px" }}><ArrowForwardIosIcon fontSize="small" /></Button>
            </Box>
            <Typography variant="body2" color="text.secondary">Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> (Total: {totalItems} data)</Typography>
          </Box>
        )}

        {/* ======================= DIALOG 2.2 ======================= */}
        
        {/* MODAL 1: TAMBAH PESERTA */}
        <AppDialog
          open={addDialog.open}
          onClose={addDialog.closeDialog}
          title="Tambah Peserta Baru"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={addDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleSubmitAdd} color="primary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </Box>
          }
        >
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">NIP</Typography>
              <AppInput
                placeholder="Masukkan NIP"
                value={addForm.nip}
                onChange={(e) => setAddForm({ ...addForm, nip: e.target.value })}
              />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Lengkap</Typography>
              <AppInput
                placeholder="Masukkan Nama Lengkap"
                value={addForm.nama_lengkap}
                onChange={(e) => setAddForm({ ...addForm, nama_lengkap: e.target.value })}
              />
            </Box>
            
            {/* TAMBAHAN TANGGAL LAHIR DI SINI */}
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tanggal Lahir</Typography>
              <AppDatePicker
                label="Tgl Lahir"
                title="PILIH TANGGAL LAHIR"
                value={addForm.tgl_lahir}
                onChange={(val) => setAddForm({ ...addForm, tgl_lahir: val })}
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Divisi</Typography>
              <Select
                fullWidth
                displayEmpty
                value={addForm.id_divisi}
                onChange={(e) => setAddForm({ ...addForm, id_divisi: e.target.value })}
                sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}
              >
                <MenuItem value="" disabled>Pilih Divisi</MenuItem>
                {divisiList.map((div) => (
                  <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </AppDialog>

        {/* MODAL 2: RESET SEMUA */}
        <AppDialog
          open={resetAllDialog.open}
          onClose={resetAllDialog.closeDialog}
          title="Hapus Seluruh Data Peserta"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={resetAllDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleResetAll} color="error" variant="contained" disabled={confirmKeyword !== "RESET-SEMUA" || isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>
                {isSubmitting ? "Menghapus..." : "Hapus Permanen"}
              </Button>
            </Box>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography color="error.main" fontWeight={700} fontSize="1.1rem">
              PERINGATAN BAHAYA!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Tindakan ini akan menghapus <strong>seluruh data peserta</strong> (ribuan data) secara permanen dan tidak dapat dibatalkan.
              Ketik <strong>RESET-SEMUA</strong> pada kolom di bawah ini untuk mengonfirmasi tindakan Anda.
            </Typography>
            <Box mt={1}>
              <AppInput
                placeholder="Ketik RESET-SEMUA"
                value={confirmKeyword}
                onChange={(e) => setConfirmKeyword(e.target.value)}
              />
            </Box>
          </Box>
        </AppDialog>

        {/* MODAL 3: HAPUS 1 PESERTA (Diganti pakai Reusable ConfirmDialog) */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={closeConfirm}
          onConfirm={handleConfirm}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
        />

        {/* KOMPONEN SNACKBAR */}
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