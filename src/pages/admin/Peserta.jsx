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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import AppSnackbar from "../../components/ui/AppSnackbar";
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

export default function PesertaPage() {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  // State Data & Pagination
  const [peserta, setPeserta] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Navigasi
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("");

  // State Dialog Hapus
  const [deleteSingleOpen, setDeleteSingleOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState(null);

  const token = localStorage.getItem("admin_token");

  // FETCH DATA DIVISI (Untuk Dropdown)
  const fetchDivisi = useCallback(async () => {
    try {
      const authHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(`${BACKEND_URL}/api/admin/divisi`, { headers: authHeader });
      const json = await res.json();
      if (json.success) setDivisiList(json.data);
    } catch (err) {
      console.error("Gagal load divisi:", err);
    }
  }, [token]);

  // FETCH DATA PESERTA (Paged)
  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      const authHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const query = new URLSearchParams({
        page,
        limit,
        search: activeSearch,
        divisi: selectedDivisi,
      }).toString();

      const res = await fetch(`${BACKEND_URL}/api/admin/peserta-paged?${query}`, {
        headers: authHeader,
      });
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

  // Eksekusi Fetch saat komponen mount atau state navigasi berubah
  useEffect(() => {
    fetchDivisi();
  }, [fetchDivisi]);

  useEffect(() => {
    fetchPeserta();
  }, [fetchPeserta]);

  // HANDLER FILTER
  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      setActiveSearch(searchInput);
      setPage(1); // Kembali ke halaman 1 tiap kali mencari
    }
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setActiveSearch("");
    setSelectedDivisi("");
    setPage(1);
  };

  // HANDLER DELETE SINGLE
  const handleDeleteSingle = async () => {
    if (!selectedPeserta?.id_user) return;
    try {
      const authHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(`${BACKEND_URL}/api/admin/peserta/${selectedPeserta.id_user}`, {
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
    } finally {
      setDeleteSingleOpen(false);
      setSelectedPeserta(null);
    }
  };

  // Placeholder untuk Sub-Tahap Selanjutnya
  const handleOpenAddModal = () => console.log("Buka Modal Tambah");
  const handleOpenResetAllModal = () => console.log("Buka Modal Reset Semua");
  const handleView = (row) => console.log("Lihat Detail:", row);
  const handleEdit = (row) => console.log("Edit Peserta:", row);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 } }}>
        
        {/* 1. HEADER & ACTION BUTTONS */}
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

        {/* 2. FILTER BAR */}
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          {/* Input Search */}
          <TextField
            size="small"
            placeholder="Cari NIP atau Nama..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch} sx={{ borderRadius: "8px" }}>
            Cari
          </Button>

          {/* Select Divisi */}
          <Select
            size="small"
            displayEmpty
            value={selectedDivisi}
            onChange={(e) => {
              setSelectedDivisi(e.target.value);
              setPage(1);
            }}
            sx={{ flex: { xs: "1 1 100%", md: "0 1 250px" }, borderRadius: "8px" }}
          >
            <MenuItem value=""><em>Semua Divisi</em></MenuItem>
            {divisiList.map((div) => (
              <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>
            ))}
          </Select>

          {/* Tombol Reset Filter */}
          <Button
            variant="text"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={handleResetFilter}
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            Reset
          </Button>
        </Paper>

        {/* 3. TABEL DATA PESERTA */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", minHeight: "400px" }}>
          {loading ? (
            <div className="p-4">
              <LoadingSkeleton variant="table" count={5} />
            </div>
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
                      <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        Belum ada peserta yang ditemukan.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  peserta.map((row, index) => (
                    <TableRow key={row.id_user} hover>
                      <TableCell align="center">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>{row.nip}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>{row.nama_lengkap}</TableCell>
                      <TableCell>{row.nama_divisi || "-"}</TableCell>
                      
                      {/* KOLOM STATUS (OPSI C: CHIP + TEKS) */}
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
                            sx={{ 
                              fontSize: "0.65rem", 
                              fontWeight: 700, 
                              color: row.status_terdaftar === "sudah" ? "primary.main" : "error.main" 
                            }}
                          >
                            {row.status_terdaftar === "sudah" ? "Terdaftar" : "Belum Terdaftar"}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton size="small" color="primary" onClick={() => handleView(row)} sx={{ bgcolor: "rgba(8,65,92,0.1)" }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="secondary" onClick={() => handleEdit(row)} sx={{ bgcolor: "rgba(179,156,77,0.1)" }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => { setSelectedPeserta(row); setDeleteSingleOpen(true); }} sx={{ bgcolor: "rgba(211,47,47,0.1)" }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* 4. FOOTER PAGINATION */}
        {!loading && totalItems > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 1, px: 1 }}>
            
            {/* Kiri: Limit Dropdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Tampilkan:</Typography>
              <Select
                size="small"
                value={limit}
                onChange={(e) => {
                  setLimit(e.target.value);
                  setPage(1); // Kembali ke hal 1 saat limit diganti
                }}
                sx={{ borderRadius: "8px", height: "35px" }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>

            {/* Tengah: Navigasi Angka & Panah */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                sx={{ minWidth: "40px", p: 1, borderRadius: "8px" }}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </Button>
              <Typography variant="body2" fontWeight="bold">
                {page}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                sx={{ minWidth: "40px", p: 1, borderRadius: "8px" }}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </Button>
            </Box>

            {/* Kanan: Info Total Halaman */}
            <Typography variant="body2" color="text.secondary">
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> (Total: {totalItems} data)
            </Typography>
          </Box>
        )}

        {/* 5. MUI DIALOG: KONFIRMASI HAPUS 1 PESERTA */}
        <Dialog 
          open={deleteSingleOpen} 
          onClose={() => setDeleteSingleOpen(false)}
          PaperProps={{ sx: { borderRadius: 3, p: 1, minWidth: { xs: '90vw', sm: '400px' } } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "primary.main" }}>
            Hapus Peserta
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Apakah Anda yakin ingin menghapus peserta <strong>{selectedPeserta?.nama_lengkap}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteSingleOpen(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2 }}>
              Batal
            </Button>
            <Button onClick={handleDeleteSingle} color="error" variant="contained" sx={{ borderRadius: 2, boxShadow: "none" }}>
              Hapus
            </Button>
          </DialogActions>
        </Dialog>

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