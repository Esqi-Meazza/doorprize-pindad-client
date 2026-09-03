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
  Select,
  MenuItem,
} from "@mui/material";

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Config & Hooks
import { BACKEND_URL } from "../../config/socket";
import useSnackbar from "../../hooks/useSnackbar";
import useDialog from "../../hooks/useDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";
import { useAuth } from "../../context/AuthContext.jsx";

// Reusable Components
import AppSnackbar from "../../components/ui/AppSnackbar";
import AppDialog from "../../components/ui/AppDialog";
import AppInput from "../../components/ui/AppInput";
import AppDatePicker from "../../components/ui/AppDatePicker";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import AppFilterBar from "../../components/common/AppFilterBar";
import AppPagination from "../../components/common/AppPagination";

const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, 
    secondary: { main: "#b39c4d" },
    success: { main: "#157145" }, 
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
});

// Helper Parse DB Date ke format AppDatePicker
const parseDateForPicker = (dbDate) => {
  if (!dbDate) return { day: "01", month: "Jan", year: "2000", date: "2000-01-01" };
  const d = new Date(dbDate);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear());
  const date = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${day}`;
  return { day, month, year, date };
};

const DEFAULT_ADD_FORM = { 
  nip: "", 
  nama_lengkap: "", 
  id_divisi: "",
  tgl_lahir: { day: "01", month: "Jan", year: "2000", date: "2000-01-01" }
};

export default function PesertaPage() {
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const addDialog = useDialog();
  const resetAllDialog = useDialog();
  const viewDialog = useDialog();
  const editDialog = useDialog();
  const { dialog: confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();
  const { authHeaders } = useAuth();

  // State Data & Pagination
  const [peserta, setPeserta] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("");

  // State Forms
  const [addForm, setAddForm] = useState(DEFAULT_ADD_FORM);
  const [editForm, setEditForm] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [confirmKeyword, setConfirmKeyword] = useState("");

  // ================= FETCH DATA ================= //
  const fetchDivisi = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/divisi`, { 
        headers: authHeaders 
      });
      const json = await res.json();
      if (json.success) setDivisiList(json.data);
    } catch (err) {
      console.error("Gagal load divisi:", err);
    }
  }, [authHeaders]);

  const fetchPeserta = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit, search: activeSearch, divisi: selectedDivisi }).toString();
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta-paged?${query}`, { 
        headers: authHeaders 
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
  }, [page, limit, activeSearch, selectedDivisi, showSnackbar, authHeaders]);

  useEffect(() => { fetchDivisi(); }, [fetchDivisi]);
  useEffect(() => { fetchPeserta(); }, [fetchPeserta]);

  // ================= HANDLER FILTER ================= //
  const handleSearch = () => {
    setActiveSearch(searchInput);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setActiveSearch("");
    setSelectedDivisi("");
    setPage(1);
  };

  // ================= HANDLER CRUD ================= //
  
  // TAMBAH PESERTA
  const handleSubmitAdd = async () => {
    if (!addForm.nip || !addForm.nama_lengkap || !addForm.id_divisi) {
      showSnackbar({ message: "Field NIP, Nama Lengkap, dan Divisi wajib diisi!", severity: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...addForm, tgl_lahir: addForm.tgl_lahir?.date || null };
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta`, {
        method: "POST",
        headers: authHeaders,
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
    } finally { setIsSubmitting(false); }
  };

  // EDIT PESERTA
  const handleOpenEdit = (row, e) => {
    e.stopPropagation(); // Mencegah Row di-klik
    setEditForm({
      ...row,
      tgl_lahir: parseDateForPicker(row.tgl_lahir)
    });
    editDialog.openDialog();
  };

  const handleSubmitEdit = async () => {
    if (!editForm.nip || !editForm.nama_lengkap || !editForm.id_divisi) {
      showSnackbar({ message: "Field NIP, Nama Lengkap, dan Divisi wajib diisi!", severity: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        nip: editForm.nip,
        nama_lengkap: editForm.nama_lengkap,
        id_divisi: editForm.id_divisi,
        tgl_lahir: editForm.tgl_lahir?.date || null,
        status_terdaftar: editForm.status_terdaftar,
        status_menang: editForm.status_menang
      };

      const res = await fetch(`${BACKEND_URL}/api/admin/peserta/${editForm.id_user}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        showSnackbar({ message: json.message, severity: "success" });
        editDialog.closeDialog();
        fetchPeserta();
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
    } finally { setIsSubmitting(false); }
  };

  // HAPUS SINGLE PESERTA
  const handleDeleteSingle = (row, e) => {
    e.stopPropagation(); // Mencegah Row di-klik
    openConfirm({
      title: "Hapus Peserta",
      message: `Apakah Anda yakin ingin menghapus peserta ${row.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/admin/peserta/${row.id_user}`, {
            method: "DELETE",
            headers: authHeaders,
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

  // RESET SEMUA PESERTA
  const handleResetAll = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/peserta/reset-all`, {
        method: "POST",
        headers: authHeaders,
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
    } finally { setIsSubmitting(false); }
  };

  // VIEW PESERTA (Row Click)
  const handleView = (row) => {
    setViewData(row);
    viewDialog.openDialog();
  };

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
              variant="outlined" color="error"
              startIcon={<WarningAmberIcon />}
              onClick={() => { setConfirmKeyword(""); resetAllDialog.openDialog(); }}
              sx={{ fontWeight: "bold", borderRadius: "8px" }}
            >
              Hapus Semua
            </Button>
            <Button
              variant="contained" color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => { setAddForm(DEFAULT_ADD_FORM); addDialog.openDialog(); }}
              sx={{ fontWeight: "bold", borderRadius: "8px", boxShadow: "none" }}
            >
              Tambah Peserta
            </Button>
          </Box>
        </Box>

        {/* REUSABLE FILTER BAR */}
        <AppFilterBar 
          searchInput={searchInput} 
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onReset={handleResetFilter}
          placeholder="Cari NIP atau Nama..."
        >
          <Select
            size="small" displayEmpty value={selectedDivisi}
            onChange={(e) => { setSelectedDivisi(e.target.value); setPage(1); }}
            sx={{ flex: { xs: "1 1 100%", md: "0 1 250px" }, borderRadius: "8px" }}
          >
            <MenuItem value=""><em>Semua Divisi</em></MenuItem>
            {divisiList.map((div) => (
              <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>
            ))}
          </Select>
        </AppFilterBar>

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
                    <TableRow 
                      key={row.id_user} 
                      hover 
                      onClick={() => handleView(row)} 
                      sx={{ cursor: "pointer" }}
                    >
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
                          <IconButton size="small" color="secondary" onClick={(e) => handleOpenEdit(row, e)} sx={{ bgcolor: "rgba(179,156,77,0.1)" }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={(e) => handleDeleteSingle(row, e)} sx={{ bgcolor: "rgba(211,47,47,0.1)" }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* REUSABLE PAGINATION */}
        <AppPagination 
          page={page} setPage={setPage}
          limit={limit} setLimit={setLimit}
          totalPages={totalPages} totalItems={totalItems}
          loading={loading}
        />

        {/* ======================= MODAL DIALOGS ======================= */}
        
        {/* MODAL 1: VIEW PESERTA */}
        <AppDialog open={viewDialog.open} onClose={viewDialog.closeDialog} title="Detail Peserta">
          {viewData && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 1 }}>
                <Typography color="text.secondary" fontWeight={600}>ID Peserta</Typography>
                <Typography fontWeight={700}>: {viewData.id_user}</Typography>
                
                <Typography color="text.secondary" fontWeight={600}>NIP</Typography>
                <Typography fontWeight={700}>: {viewData.nip}</Typography>
                
                <Typography color="text.secondary" fontWeight={600}>Nama</Typography>
                <Typography fontWeight={700} color="primary.main">: {viewData.nama_lengkap}</Typography>
                
                <Typography color="text.secondary" fontWeight={600}>Divisi</Typography>
                <Typography fontWeight={700}>: {viewData.nama_divisi || "-"}</Typography>

                <Typography color="text.secondary" fontWeight={600}>Tgl Lahir</Typography>
                <Typography fontWeight={700}>: {viewData.tgl_lahir ? new Date(viewData.tgl_lahir).toLocaleDateString("id-ID") : "-"}</Typography>
              </Box>
              <Box sx={{ mt: 2, display: "flex", gap: 2, p: 2, bgcolor: "rgba(8,65,92,0.05)", borderRadius: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Status Terdaftar</Typography>
                  <Chip label={viewData.status_terdaftar === "sudah" ? "Terdaftar" : "Belum"} color={viewData.status_terdaftar === "sudah" ? "primary" : "default"} size="small" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Status Menang</Typography>
                  <Chip label={viewData.status_menang === "sudah" ? "Sudah" : "Belum"} color={viewData.status_menang === "sudah" ? "success" : "default"} size="small" />
                </Box>
              </Box>
            </Box>
          )}
        </AppDialog>

        {/* MODAL 2: EDIT PESERTA */}
        <AppDialog
          open={editDialog.open} onClose={editDialog.closeDialog} title="Edit Peserta"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={editDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleSubmitEdit} color="secondary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none", color: "white" }}>
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </Box>
          }
        >
          {editForm && (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">NIP</Typography>
                <AppInput placeholder="Masukkan NIP" value={editForm.nip} onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Lengkap</Typography>
                <AppInput placeholder="Masukkan Nama Lengkap" value={editForm.nama_lengkap} onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tanggal Lahir</Typography>
                <AppDatePicker label="Tgl Lahir" title="PILIH TANGGAL LAHIR" value={editForm.tgl_lahir} onChange={(val) => setEditForm({ ...editForm, tgl_lahir: val })} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Divisi</Typography>
                <Select fullWidth value={editForm.id_divisi} onChange={(e) => setEditForm({ ...editForm, id_divisi: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                  <MenuItem value="" disabled>Pilih Divisi</MenuItem>
                  {divisiList.map((div) => <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>)}
                </Select>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Status Terdaftar</Typography>
                  <Select fullWidth value={editForm.status_terdaftar} onChange={(e) => setEditForm({ ...editForm, status_terdaftar: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                    <MenuItem value="sudah">Terdaftar</MenuItem>
                    <MenuItem value="belum">Belum</MenuItem>
                  </Select>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Status Menang</Typography>
                  <Select fullWidth value={editForm.status_menang} onChange={(e) => setEditForm({ ...editForm, status_menang: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                    <MenuItem value="sudah">Menang</MenuItem>
                    <MenuItem value="belum">Belum</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Box>
          )}
        </AppDialog>

        {/* MODAL 3: TAMBAH PESERTA */}
        <AppDialog
          open={addDialog.open} onClose={addDialog.closeDialog} title="Tambah Peserta Baru"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={addDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleSubmitAdd} color="primary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            </Box>
          }
        >
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">NIP</Typography><AppInput placeholder="Masukkan NIP" value={addForm.nip} onChange={(e) => setAddForm({ ...addForm, nip: e.target.value })} /></Box>
            <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Lengkap</Typography><AppInput placeholder="Masukkan Nama Lengkap" value={addForm.nama_lengkap} onChange={(e) => setAddForm({ ...addForm, nama_lengkap: e.target.value })} /></Box>
            <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tanggal Lahir</Typography><AppDatePicker label="Tgl Lahir" title="PILIH TANGGAL LAHIR" value={addForm.tgl_lahir} onChange={(val) => setAddForm({ ...addForm, tgl_lahir: val })} /></Box>
            <Box>
              <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Divisi</Typography>
              <Select fullWidth displayEmpty value={addForm.id_divisi} onChange={(e) => setAddForm({ ...addForm, id_divisi: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                <MenuItem value="" disabled>Pilih Divisi</MenuItem>
                {divisiList.map((div) => <MenuItem key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</MenuItem>)}
              </Select>
            </Box>
          </Box>
        </AppDialog>

        {/* MODAL 4: RESET SEMUA */}
        <AppDialog
          open={resetAllDialog.open} onClose={resetAllDialog.closeDialog} title="Hapus Seluruh Data Peserta"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={resetAllDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleResetAll} color="error" variant="contained" disabled={confirmKeyword !== "RESET-SEMUA" || isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>{isSubmitting ? "Menghapus..." : "Hapus Permanen"}</Button>
            </Box>
          }
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography color="error.main" fontWeight={700} fontSize="1.1rem">PERINGATAN BAHAYA!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Tindakan ini akan menghapus <strong>seluruh data peserta</strong> secara permanen. Ketik <strong>RESET-SEMUA</strong> untuk mengonfirmasi.
            </Typography>
            <AppInput placeholder="Ketik RESET-SEMUA" value={confirmKeyword} onChange={(e) => setConfirmKeyword(e.target.value)} />
          </Box>
        </AppDialog>

        {/* MODAL 5: HAPUS 1 PESERTA */}
        <ConfirmDialog
          open={confirmDialog.open} onClose={closeConfirm} onConfirm={handleConfirm}
          title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={confirmDialog.cancelText}
        />

        <AppSnackbar
          open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} anchorOrigin={snackbar.anchorOrigin} onClose={closeSnackbar}
        />
      </Box>
    </ThemeProvider>
  );
}