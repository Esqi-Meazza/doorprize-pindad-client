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
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Config & Hooks
import { BACKEND_URL } from "../../config/socket";
import useSnackbar from "../../hooks/useSnackbar";
import useDialog from "../../hooks/useDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";

// Reusable Components
import AppSnackbar from "../../components/ui/AppSnackbar";
import AppDialog from "../../components/ui/AppDialog";
import AppInput from "../../components/ui/AppInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import AppFilterBar from "../../components/common/AppFilterBar";
import AppPagination from "../../components/common/AppPagination";

const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, // Biru
    secondary: { main: "#b39c4d" }, // Golden
    success: { main: "#157145" }, // Hijau
    error: { main: "#d32f2f" },
  },
  typography: { fontFamily: "inherit" },
});

const DEFAULT_ADD_FORM = {
  nama_hadiah: "",
  tipe: "",
  id_kelompok: "", // Ditambahkan
  stok_total: 1,
};

export default function HadiahPage() {
  // Hooks
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const addDialog = useDialog();
  const editDialog = useDialog();
  const viewDialog = useDialog();
  const { dialog: confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();

  // State Data & Pagination
  const [hadiah, setHadiah] = useState([]);
  const [kelompokList, setKelompokList] = useState([]); // State untuk Dropdown Kelompok
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedTipe, setSelectedTipe] = useState("");

  // State Forms
  const [addForm, setAddForm] = useState(DEFAULT_ADD_FORM);
  const [editForm, setEditForm] = useState(null);
  const [viewData, setViewData] = useState(null);

  const token = localStorage.getItem("admin_token");
  const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // ================= FETCH DATA ================= //
  
  // Fetch Dropdown Kelompok
  const fetchKelompok = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/kelompok`, { headers: authHeader });
      const json = await res.json();
      if (json.success) setKelompokList(json.data);
    } catch (err) {
      console.error("Gagal load kelompok:", err);
    }
  }, [token]);

  // Fetch Tabel Hadiah
  const fetchHadiah = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit, search: activeSearch, tipe: selectedTipe }).toString();
      const res = await fetch(`${BACKEND_URL}/api/admin/hadiah-paged?${query}`, { headers: authHeader });
      const json = await res.json();

      if (json.success) {
        setHadiah(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Gagal memuat data hadiah", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, limit, activeSearch, selectedTipe, showSnackbar, token]);

  useEffect(() => { 
    fetchKelompok();
    fetchHadiah(); 
  }, [fetchKelompok, fetchHadiah]);

  // ================= HANDLER FILTER ================= //
  const handleSearch = () => {
    setActiveSearch(searchInput);
    setPage(1);
  };

  const handleResetFilter = () => {
    setSearchInput("");
    setActiveSearch("");
    setSelectedTipe("");
    setPage(1);
  };

  // ================= HANDLER CRUD ================= //
  
  // 1. TAMBAH HADIAH
  const handleSubmitAdd = async () => {
    if (!addForm.nama_hadiah || !addForm.tipe || !addForm.stok_total) {
      showSnackbar({ message: "Nama, Tipe, dan Stok wajib diisi!", severity: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...addForm,
        id_kelompok: addForm.id_kelompok === "" ? null : addForm.id_kelompok
      };

      const res = await fetch(`${BACKEND_URL}/api/admin/hadiah`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      
      if (json.success) {
        showSnackbar({ message: json.message, severity: "success" });
        addDialog.closeDialog();
        fetchHadiah();
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
    } finally { setIsSubmitting(false); }
  };

  // 2. EDIT HADIAH
  const handleOpenEdit = (row, e) => {
    e.stopPropagation();
    setEditForm({ ...row });
    editDialog.openDialog();
  };

  const handleSubmitEdit = async () => {
    if (!editForm.nama_hadiah || !editForm.tipe || editForm.stok_total === "") {
      showSnackbar({ message: "Nama, Tipe, dan Stok wajib diisi!", severity: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/hadiah/${editForm.id_hadiah}`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify({
          nama_hadiah: editForm.nama_hadiah,
          tipe: editForm.tipe,
          stok_total: Number(editForm.stok_total),
          id_kelompok: editForm.id_kelompok === "" ? null : editForm.id_kelompok, // Handle empty state
        }),
      });
      const json = await res.json();
      
      if (json.success) {
        showSnackbar({ message: json.message, severity: "success" });
        editDialog.closeDialog();
        fetchHadiah();
      } else {
        showSnackbar({ message: json.error, severity: "error" });
      }
    } catch (err) {
      showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
    } finally { setIsSubmitting(false); }
  };

  // 3. HAPUS HADIAH
  const handleDelete = (row, e) => {
    e.stopPropagation();
    openConfirm({
      title: "Hapus Hadiah",
      message: `Apakah Anda yakin ingin menghapus hadiah "${row.nama_hadiah}"? Hadiah yang sudah dimenangkan peserta tidak dapat dihapus.`,
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/admin/hadiah/${row.id_hadiah}`, {
            method: "DELETE",
            headers: authHeader,
          });
          const json = await res.json();

          if (json.success) {
            showSnackbar({ message: json.message, severity: "success" });
            fetchHadiah();
          } else {
            showSnackbar({ message: json.error, severity: "error" }); 
          }
        } catch (err) {
          showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
        }
      }
    });
  };

  // 4. VIEW DETAIL
  const handleView = (row) => {
    setViewData(row);
    viewDialog.openDialog();
  };

  // Helper Warna Tipe Hadiah
  const getTipeColor = (tipe) => {
    switch (tipe) {
      case "super": return "secondary"; 
      case "grand": return "primary"; 
      case "reguler": return "success"; 
      default: return "default";
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 } }}>
        
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, display: 'flex', alignItems: 'center'}}>
            Data Hadiah
          </Typography>
          <Button
            variant="contained" color="primary"
            startIcon={<AddCircleOutlineOutlinedIcon />}
            onClick={() => { setAddForm(DEFAULT_ADD_FORM); addDialog.openDialog(); }}
            sx={{ fontWeight: "bold", borderRadius: "8px", boxShadow: "none" }}
          >
            Tambah Hadiah
          </Button>
        </Box>

        {/* FILTER BAR */}
        <AppFilterBar 
          searchInput={searchInput} setSearchInput={setSearchInput}
          onSearch={handleSearch} onReset={handleResetFilter}
          placeholder="Cari Nama Hadiah..."
        >
          <Select
            size="small" displayEmpty value={selectedTipe}
            onChange={(e) => { setSelectedTipe(e.target.value); setPage(1); }}
            sx={{ flex: { xs: "1 1 100%", md: "0 1 200px" }, borderRadius: "8px" }}
          >
            <MenuItem value=""><em>Semua Tipe</em></MenuItem>
            <MenuItem value="super">Super</MenuItem>
            <MenuItem value="grand">Grand</MenuItem>
            <MenuItem value="reguler">Reguler</MenuItem>
          </Select>
        </AppFilterBar>

        {/* TABEL DATA HADIAH */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", minHeight: "400px" }}>
          {loading ? (
            <div className="p-4"><LoadingSkeleton variant="table" count={5} /></div>
          ) : (
            <Table sx={{ minWidth: 850 }}>
              <TableHead sx={{ bgcolor: "primary.main" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "5%", py: 2, textAlign: "center" }}>NO</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "25%", py: 2 }}>Nama Hadiah</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2 }}>Kelompok</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Tipe</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Sisa Stok</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2, textAlign: "center" }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hadiah.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" sx={{ color: "text.secondary" }}>Belum ada data hadiah.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  hadiah.map((row, index) => (
                    <TableRow key={row.id_hadiah} hover onClick={() => handleView(row)} sx={{ cursor: "pointer" }}>
                      <TableCell align="center">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{row.nama_hadiah}</TableCell>
                      <TableCell>{row.nama_kelompok || "-"}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.tipe?.toUpperCase() || "-"} color={getTipeColor(row.tipe)} size="small" sx={{ fontWeight: "bold", fontSize: "0.7rem" }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Typography variant="body2" fontWeight={800} color={row.stok_sisa === 0 ? "error.main" : "text.primary"}>
                            {row.stok_sisa} / {row.stok_total}
                          </Typography>
                          {row.stok_sisa === 0 && (
                            <Chip label="HABIS" color="error" size="small" sx={{ height: 16, fontSize: "0.6rem", mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <IconButton size="small" color="secondary" onClick={(e) => handleOpenEdit(row, e)} sx={{ bgcolor: "rgba(179,156,77,0.1)" }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={(e) => handleDelete(row, e)} sx={{ bgcolor: "rgba(211,47,47,0.1)" }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* PAGINATION */}
        <AppPagination 
          page={page} setPage={setPage} limit={limit} setLimit={setLimit}
          totalPages={totalPages} totalItems={totalItems} loading={loading}
        />

        {/* ======================= MODALS ======================= */}
        
        {/* MODAL VIEW */}
        <AppDialog open={viewDialog.open} onClose={viewDialog.closeDialog} title="Detail Hadiah">
          {viewData && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 1.5 }}>
                <Typography color="text.secondary" fontWeight={600}>ID Hadiah</Typography>
                <Typography fontWeight={700}>: {viewData.id_hadiah}</Typography>
                
                <Typography color="text.secondary" fontWeight={600}>Nama Hadiah</Typography>
                <Typography fontWeight={800} color="primary.main" sx={{ fontSize: '1.1rem' }}>: {viewData.nama_hadiah}</Typography>
                
                <Typography color="text.secondary" fontWeight={600}>Kelompok</Typography>
                <Typography fontWeight={700}>: {viewData.nama_kelompok || "-"}</Typography>

                <Typography color="text.secondary" fontWeight={600}>Tipe Hadiah</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>: <Chip label={viewData.tipe?.toUpperCase()} color={getTipeColor(viewData.tipe)} size="small" sx={{ fontWeight: "bold" }} /></Box>
              </Box>
              
              <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", p: 2, bgcolor: "rgba(8,65,92,0.05)", borderRadius: 2 }}>
                <Box textAlign="center" flex={1}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Total Stok Awal</Typography>
                  <Typography variant="h6" fontWeight={800}>{viewData.stok_total}</Typography>
                </Box>
                <Box textAlign="center" flex={1} sx={{ borderLeft: "2px solid rgba(0,0,0,0.1)", paddingLeft: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Stok Sisa</Typography>
                  <Typography variant="h6" fontWeight={800} color={viewData.stok_sisa === 0 ? "error.main" : "success.main"}>
                    {viewData.stok_sisa}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </AppDialog>

        {/* MODAL TAMBAH */}
        <AppDialog
          open={addDialog.open} onClose={addDialog.closeDialog} title="Tambah Hadiah Baru"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={addDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleSubmitAdd} color="primary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            </Box>
          }
        >
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Hadiah</Typography><AppInput placeholder="Cth: Sepeda Listrik" value={addForm.nama_hadiah} onChange={(e) => setAddForm({ ...addForm, nama_hadiah: e.target.value })} /></Box>
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tipe Hadiah</Typography>
                <Select fullWidth displayEmpty value={addForm.tipe} onChange={(e) => setAddForm({ ...addForm, tipe: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                  <MenuItem value="" disabled>Pilih Tipe</MenuItem>
                  <MenuItem value="super">Super</MenuItem>
                  <MenuItem value="grand">Grand</MenuItem>
                  <MenuItem value="reguler">Reguler</MenuItem>
                </Select>
              </Box>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Kelompok</Typography>
                <Select fullWidth displayEmpty value={addForm.id_kelompok} onChange={(e) => setAddForm({ ...addForm, id_kelompok: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                  <MenuItem value="">Pilih (Opsional)</MenuItem>
                  {kelompokList.map((k) => (
                    <MenuItem key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Stok Total</Typography><AppInput type="number" placeholder="0" value={addForm.stok_total} onChange={(e) => setAddForm({ ...addForm, stok_total: e.target.value })} inputProps={{ min: 1 }} /></Box>
          </Box>
        </AppDialog>

        {/* MODAL EDIT */}
        <AppDialog
          open={editDialog.open} onClose={editDialog.closeDialog} title="Edit Data Hadiah"
          actions={
            <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
              <Button onClick={editDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
              <Button onClick={handleSubmitEdit} color="secondary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none", color: "white" }}>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</Button>
            </Box>
          }
        >
          {editForm && (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
              <Typography variant="caption" color="warning.main" sx={{ bgcolor: "rgba(179,156,77,0.1)", p: 1.5, borderRadius: 2 }}>
                *Catatan: Menurunkan Stok Total tidak boleh lebih kecil dari jumlah yang sudah dimenangkan peserta.
              </Typography>
              <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Hadiah</Typography><AppInput placeholder="Nama Hadiah" value={editForm.nama_hadiah} onChange={(e) => setEditForm({ ...editForm, nama_hadiah: e.target.value })} /></Box>
              
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tipe Hadiah</Typography>
                  <Select fullWidth value={editForm.tipe} onChange={(e) => setEditForm({ ...editForm, tipe: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                    <MenuItem value="super">Super</MenuItem>
                    <MenuItem value="grand">Grand</MenuItem>
                    <MenuItem value="reguler">Reguler</MenuItem>
                  </Select>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Kelompok</Typography>
                  <Select fullWidth displayEmpty value={editForm.id_kelompok || ""} onChange={(e) => setEditForm({ ...editForm, id_kelompok: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                    <MenuItem value="">Pilih (Opsional)</MenuItem>
                    {kelompokList.map((k) => (
                      <MenuItem key={k.id_kelompok} value={k.id_kelompok}>{k.nama_kelompok}</MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>

              <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Stok Total</Typography><AppInput type="number" value={editForm.stok_total} onChange={(e) => setEditForm({ ...editForm, stok_total: e.target.value })} inputProps={{ min: 1 }} /></Box>
            </Box>
          )}
        </AppDialog>

        <ConfirmDialog open={confirmDialog.open} onClose={closeConfirm} onConfirm={handleConfirm} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={confirmDialog.cancelText} />
        <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} anchorOrigin={snackbar.anchorOrigin} onClose={closeSnackbar} />
      </Box>
    </ThemeProvider>
  );
}