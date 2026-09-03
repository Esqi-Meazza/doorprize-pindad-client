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
import { useAuth } from "../../context/AuthContext.jsx";

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
        primary: { main: "#08415c" }, 
        secondary: { main: "#b39c4d" },
        success: { main: "#157145" }, 
        error: { main: "#d32f2f" },
        warning: { main: "#ff9800" },
        info: { main: "#0288d1" }
    },
    typography: { fontFamily: "inherit" },
});

const DEFAULT_ADD_FORM = {
    nama_kelompok: "",
    tipe_event: "",
    urutan_sesi: 1,
    target_jumlah_pemenang: 1,
};

export default function KelompokHadiahPage() {
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const addDialog = useDialog();
    const editDialog = useDialog();
    const viewDialog = useDialog();
    const { dialog: confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();
    const { authHeaders: authHeader } = useAuth();

    // State Data & Pagination
    const [kelompok, setKelompok] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [searchInput, setSearchInput] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [selectedTipe, setSelectedTipe] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // State Forms
    const [addForm, setAddForm] = useState(DEFAULT_ADD_FORM);
    const [editForm, setEditForm] = useState(null);
    const [viewData, setViewData] = useState(null);

  // ================= FETCH DATA ================= //
    const fetchKelompok = useCallback(async () => {
        setLoading(true);
        try {
        const query = new URLSearchParams({ 
            page, limit, search: activeSearch, tipe: selectedTipe, status: selectedStatus 
        }).toString();
        
        const res = await fetch(`${BACKEND_URL}/api/admin/kelompok-paged?${query}`, { headers: authHeader });
        const json = await res.json();

        if (json.success) {
            setKelompok(json.data);
            setTotalPages(json.pagination.totalPages);
            setTotalItems(json.pagination.totalItems);
        } else {
            showSnackbar({ message: json.error, severity: "error" });
        }
        } catch (err) {
        showSnackbar({ message: "Gagal memuat data kelompok hadiah", severity: "error" });
        } finally {
        setLoading(false);
        }
    }, [page, limit, activeSearch, selectedTipe, selectedStatus, showSnackbar, authHeader]);

    useEffect(() => { fetchKelompok(); }, [fetchKelompok]);

    // ================= HANDLER FILTER ================= //
    const handleSearch = () => {
        setActiveSearch(searchInput);
        setPage(1);
    };

    const handleResetFilter = () => {
        setSearchInput("");
        setActiveSearch("");
        setSelectedTipe("");
        setSelectedStatus("");
        setPage(1);
    };

  // ================= HANDLER CRUD ================= //

  // 1. TAMBAH KELOMPOK
    const handleSubmitAdd = async () => {
        if (!addForm.nama_kelompok || !addForm.tipe_event) {
        showSnackbar({ message: "Field Nama, Tipe Event, dan Status wajib diisi!", severity: "error" });
        return;
        }
        setIsSubmitting(true);
        try {
        const res = await fetch(`${BACKEND_URL}/api/admin/kelompok`, {
            method: "POST",
            headers: authHeader,
            body: JSON.stringify({
            ...addForm,
            urutan_sesi: Number(addForm.urutan_sesi),
            target_jumlah_pemenang: Number(addForm.target_jumlah_pemenang)
            }),
        });
        const json = await res.json();
        
        if (json.success) {
            showSnackbar({ message: json.message, severity: "success" });
            addDialog.closeDialog();
            fetchKelompok();
        } else {
            showSnackbar({ message: json.error, severity: "error" });
        }
        } catch (err) {
        showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
        } finally { setIsSubmitting(false); }
    };

    // 2. EDIT KELOMPOK
    const handleOpenEdit = (row, e) => {
        e.stopPropagation();
        setEditForm({ ...row });
        editDialog.openDialog();
    };

    const handleSubmitEdit = async () => {
        if (!editForm.nama_kelompok || !editForm.tipe_event) {
        showSnackbar({ message: "Semua field wajib diisi!", severity: "error" });
        return;
        }
        setIsSubmitting(true);
        try {
        const res = await fetch(`${BACKEND_URL}/api/admin/kelompok/${editForm.id_kelompok}`, {
            method: "PUT",
            headers: authHeader,
            body: JSON.stringify({
            nama_kelompok: editForm.nama_kelompok,
            tipe_event: editForm.tipe_event,
            urutan_sesi: Number(editForm.urutan_sesi),
            target_jumlah_pemenang: Number(editForm.target_jumlah_pemenang),
            }),
        });
        const json = await res.json();
        
        if (json.success) {
            showSnackbar({ message: json.message, severity: "success" });
            editDialog.closeDialog();
            fetchKelompok();
        } else {
            showSnackbar({ message: json.error, severity: "error" });
        }
        } catch (err) {
        showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
        } finally { setIsSubmitting(false); }
    };

    // 3. HAPUS KELOMPOK
    const handleDelete = (row, e) => {
        e.stopPropagation();
        openConfirm({
        title: "Hapus Kelompok Hadiah",
        message: `Apakah Anda yakin ingin menghapus kelompok "${row.nama_kelompok}"? Kelompok yang masih memiliki daftar hadiah tidak bisa dihapus.`,
        confirmText: "Hapus",
        onConfirm: async () => {
            try {
            const res = await fetch(`${BACKEND_URL}/api/admin/kelompok/${row.id_kelompok}`, {
                method: "DELETE",
                headers: authHeader,
            });
            const json = await res.json();

            if (json.success) {
                showSnackbar({ message: json.message, severity: "success" });
                fetchKelompok();
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

    // UI Helpers
    const getTipeColor = (tipe) => {
        switch (tipe) {
        case "super": return "secondary"; // Golden
        case "grand": return "primary"; // Biru
        case "multi": return "info"; // Biru muda
        case "batch": return "default"; // Abu
        default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
        case "pending": return "warning";
        case "active": return "info";
        case "complate": return "success"; // Typonya sesuai dengan Enum di DB
        default: return "default";
        }
    };
    
    const formatStatus = (status) => {
        if (status === "complate") return "Selesai";
        if (status === "pending") return "Pending";
        if (status === "active") return "Aktif";
        return status;
    };

    return (
        <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 } }}>
            
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                Kelompok Hadiah
            </Typography>
            <Button
                variant="contained" color="primary"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={() => { setAddForm(DEFAULT_ADD_FORM); addDialog.openDialog(); }}
                sx={{ fontWeight: "bold", borderRadius: "8px", boxShadow: "none" }}
            >
                Tambah Kelompok
            </Button>
            </Box>

            {/* FILTER BAR DENGAN 2 DROPDOWN */}
            <AppFilterBar 
            searchInput={searchInput} setSearchInput={setSearchInput}
            onSearch={handleSearch} onReset={handleResetFilter}
            placeholder="Cari Nama Kelompok..."
            >
            <Select
                size="small" displayEmpty value={selectedTipe}
                onChange={(e) => { setSelectedTipe(e.target.value); setPage(1); }}
                sx={{ flex: { xs: "1 1 100%", md: "0 1 180px" }, borderRadius: "8px" }}
            >
                <MenuItem value=""><em>Semua Tipe</em></MenuItem>
                <MenuItem value="super">Super</MenuItem>
                <MenuItem value="grand">Grand</MenuItem>
                <MenuItem value="multi">Multi</MenuItem>
                <MenuItem value="batch">Batch</MenuItem>
            </Select>

            <Select
                size="small" displayEmpty value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                sx={{ flex: { xs: "1 1 100%", md: "0 1 180px" }, borderRadius: "8px" }}
            >
                <MenuItem value=""><em>Semua Status</em></MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="active">Aktif</MenuItem>
                <MenuItem value="complate">Selesai</MenuItem>
            </Select>
            </AppFilterBar>

            {/* TABEL DATA KELOMPOK */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", minHeight: "400px" }}>
            {loading ? (
                <div className="p-4"><LoadingSkeleton variant="table" count={5} /></div>
            ) : (
                <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: "primary.main" }}>
                    <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "5%", py: 2, textAlign: "center" }}>Urutan</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "25%", py: 2 }}>Nama Kelompok</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Tipe Event</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Target Menang</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Status</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2, textAlign: "center" }}>Aksi</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {kelompok.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>Belum ada data kelompok hadiah.</Typography>
                        </TableCell>
                    </TableRow>
                    ) : (
                    kelompok.map((row) => (
                        <TableRow key={row.id_kelompok} hover onClick={() => handleView(row)} sx={{ cursor: "pointer" }}>
                        <TableCell align="center">
                            <Chip label={row.urutan_sesi} size="small" sx={{ fontWeight: "bold", bgcolor: "rgba(8,65,92,0.1)" }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{row.nama_kelompok}</TableCell>
                        <TableCell align="center">
                            <Chip label={row.tipe_event?.toUpperCase() || "-"} color={getTipeColor(row.tipe_event)} size="small" sx={{ fontWeight: "bold", fontSize: "0.7rem" }} />
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="body2" fontWeight={800}>{row.target_jumlah_pemenang} Orang</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Chip label={formatStatus(row.status_sesi)} color={getStatusColor(row.status_sesi)} size="small" sx={{ fontWeight: "bold", fontSize: "0.7rem" }} />
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

            <AppPagination page={page} setPage={setPage} limit={limit} setLimit={setLimit} totalPages={totalPages} totalItems={totalItems} loading={loading} />

            {/* ======================= MODALS ======================= */}
            
            {/* MODAL VIEW */}
            <AppDialog open={viewDialog.open} onClose={viewDialog.closeDialog} title="Detail Kelompok Hadiah">
            {viewData && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 1.5 }}>
                    <Typography color="text.secondary" fontWeight={600}>ID Kelompok</Typography>
                    <Typography fontWeight={700}>: {viewData.id_kelompok}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>Nama Kelompok</Typography>
                    <Typography fontWeight={800} color="primary.main">: {viewData.nama_kelompok}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>Urutan Sesi</Typography>
                    <Typography fontWeight={700}>: Sesi Ke-{viewData.urutan_sesi}</Typography>
                </Box>
                
                <Box sx={{ mt: 2, display: "flex", gap: 2, p: 2, bgcolor: "rgba(8,65,92,0.05)", borderRadius: 2 }}>
                    <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Tipe Event</Typography>
                    <Chip label={viewData.tipe_event?.toUpperCase()} color={getTipeColor(viewData.tipe_event)} size="small" sx={{ mt: 0.5, fontWeight: "bold" }} />
                    </Box>
                    <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Status Sesi</Typography>
                    <Chip label={formatStatus(viewData.status_sesi)} color={getStatusColor(viewData.status_sesi)} size="small" sx={{ mt: 0.5, fontWeight: "bold" }} />
                    </Box>
                    <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Target Pemenang</Typography>
                    <Typography variant="body1" fontWeight={800} sx={{ mt: 0.5 }}>{viewData.target_jumlah_pemenang} Org</Typography>
                    </Box>
                </Box>
                </Box>
            )}
            </AppDialog>

            {/* MODAL TAMBAH */}
            <AppDialog
            open={addDialog.open} onClose={addDialog.closeDialog} title="Tambah Kelompok Baru"
            actions={
                <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
                <Button onClick={addDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
                <Button onClick={handleSubmitAdd} color="primary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none" }}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
                </Box>
            }
            >
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Kelompok</Typography><AppInput placeholder="Cth: Undian Grand Prize Utama" value={addForm.nama_kelompok} onChange={(e) => setAddForm({ ...addForm, nama_kelompok: e.target.value })} /></Box>
                <Box>
                    <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tipe Event</Typography>
                    <Select fullWidth displayEmpty value={addForm.tipe_event} onChange={(e) => setAddForm({ ...addForm, tipe_event: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                    <MenuItem value="" disabled>Pilih Tipe</MenuItem>
                    <MenuItem value="super">Super</MenuItem>
                    <MenuItem value="grand">Grand</MenuItem>
                    <MenuItem value="multi">Multi</MenuItem>
                    <MenuItem value="batch">Batch</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                <Box flex={1}><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Urutan Sesi</Typography><AppInput type="number" placeholder="1" value={addForm.urutan_sesi} onChange={(e) => setAddForm({ ...addForm, urutan_sesi: e.target.value })} inputProps={{ min: 1 }} /></Box>
                <Box flex={1}><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Target Pemenang</Typography><AppInput type="number" placeholder="10" value={addForm.target_jumlah_pemenang} onChange={(e) => setAddForm({ ...addForm, target_jumlah_pemenang: e.target.value })} inputProps={{ min: 1 }} /></Box>
                </Box>
            </Box>
            </AppDialog>

            {/* MODAL EDIT */}
            <AppDialog
            open={editDialog.open} onClose={editDialog.closeDialog} title="Edit Kelompok Hadiah"
            actions={
                <Box sx={{ display: "flex", gap: 2, px: 2, pb: 2 }}>
                <Button onClick={editDialog.closeDialog} color="inherit" variant="outlined" disabled={isSubmitting} sx={{ borderRadius: "8px" }}>Batal</Button>
                <Button onClick={handleSubmitEdit} color="secondary" variant="contained" disabled={isSubmitting} sx={{ borderRadius: "8px", boxShadow: "none", color: "white" }}>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</Button>
                </Box>
            }
            >
            {editForm && (
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
                <Box><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Nama Kelompok</Typography><AppInput placeholder="Nama Kelompok" value={editForm.nama_kelompok} onChange={(e) => setEditForm({ ...editForm, nama_kelompok: e.target.value })} /></Box>
                <Box>
                    <Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Tipe Event</Typography>
                    <Select fullWidth value={editForm.tipe_event} onChange={(e) => setEditForm({ ...editForm, tipe_event: e.target.value })} sx={{ borderRadius: "50px", bgcolor: "white", "& .MuiSelect-select": { py: 1.5, px: 3, fontWeight: "bold", color: "var(--color-biru)" } }}>
                        <MenuItem value="super">Super</MenuItem>
                        <MenuItem value="grand">Grand</MenuItem>
                        <MenuItem value="multi">Multi</MenuItem>
                        <MenuItem value="batch">Batch</MenuItem>
                    </Select>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Box flex={1}><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Urutan Sesi</Typography><AppInput type="number" value={editForm.urutan_sesi} onChange={(e) => setEditForm({ ...editForm, urutan_sesi: e.target.value })} inputProps={{ min: 1 }} /></Box>
                    <Box flex={1}><Typography variant="body2" fontWeight={600} mb={1} color="primary.main">Target Pemenang</Typography><AppInput type="number" value={editForm.target_jumlah_pemenang} onChange={(e) => setEditForm({ ...editForm, target_jumlah_pemenang: e.target.value })} inputProps={{ min: 1 }} /></Box>
                </Box>
                </Box>
            )}
            </AppDialog>

            <ConfirmDialog open={confirmDialog.open} onClose={closeConfirm} onConfirm={handleConfirm} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={confirmDialog.cancelText} />
            <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} anchorOrigin={snackbar.anchorOrigin} onClose={closeSnackbar} />
        </Box>
        </ThemeProvider>
    );
}