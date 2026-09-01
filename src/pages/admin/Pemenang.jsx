import { useState, useEffect, useCallback } from "react";
import {
    ThemeProvider,
    createTheme,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Select,
    MenuItem,
    Chip,
} from "@mui/material";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

// Config & Hooks
import { BACKEND_URL } from "../../config/socket";
import useSnackbar from "../../hooks/useSnackbar";
import useDialog from "../../hooks/useDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";

// Reusable Components
import AppSnackbar from "../../components/ui/AppSnackbar";
import AppDialog from "../../components/ui/AppDialog";
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

export default function PemenangPage() {
    const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
    const viewDialog = useDialog();
    const { dialog: confirmDialog, openConfirm, closeConfirm, handleConfirm } = useConfirmDialog();

    // State Data & Pagination
    const [pemenang, setPemenang] = useState([]);
    const [hadiahList, setHadiahList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    const [searchInput, setSearchInput] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [selectedHadiah, setSelectedHadiah] = useState("");

    // State View Detail
    const [viewData, setViewData] = useState(null);

    const token = localStorage.getItem("admin_token");
    const authHeader = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// ================= FETCH DATA ================= //

  // Ambil data Hadiah untuk Dropdown Filter
    const fetchHadiah = useCallback(async () => {
        try {
        const res = await fetch(`${BACKEND_URL}/api/admin/hadiah`, { headers: authHeader });
        const json = await res.json();
        if (json.success) setHadiahList(json.data);
        } catch (err) {
        console.error("Gagal load hadiah:", err);
        }
    }, [token]);

    // Ambil data Pemenang berdasar page, limit, dan filter
    const fetchPemenang = useCallback(async () => {
        setLoading(true);
        try {
        const query = new URLSearchParams({ 
            page, 
            limit, 
            search: activeSearch, 
            hadiah: selectedHadiah 
        }).toString();
        
        const res = await fetch(`${BACKEND_URL}/api/admin/pemenang-paged?${query}`, { headers: authHeader });
        const json = await res.json();

        if (json.success) {
            setPemenang(json.data);
            setTotalPages(json.pagination.totalPages);
            setTotalItems(json.pagination.totalItems);
        } else {
            showSnackbar({ message: json.error, severity: "error" });
        }
        } catch (err) {
        showSnackbar({ message: "Gagal memuat data pemenang", severity: "error" });
        } finally {
        setLoading(false);
        }
    }, [page, limit, activeSearch, selectedHadiah, showSnackbar, token]);

    useEffect(() => { fetchHadiah(); }, [fetchHadiah]);
    useEffect(() => { fetchPemenang(); }, [fetchPemenang]);

    // ================= HANDLER FILTER ================= //
    const handleSearch = () => {
        setActiveSearch(searchInput);
        setPage(1);
    };

    const handleResetFilter = () => {
        setSearchInput("");
        setActiveSearch("");
        setSelectedHadiah("");
        setPage(1);
    };

    // ================= HANDLER ACTION ================= //
    
    // VIEW DETAIL (Triger dari Klik Row)
    const handleView = (row) => {
        setViewData(row);
        viewDialog.openDialog();
    };

    // DISKUALIFIKASI / BATAL MENANG (Triger dari Icon Tong Sampah)
    const handleDiskualifikasi = (row, e) => {
        e.stopPropagation(); // Mencegah Row ter-klik sehingga modal view tidak terbuka
        
        openConfirm({
        title: "Diskualifikasi Pemenang",
        message: `Apakah Anda yakin ingin membatalkan kemenangan ${row.nama_lengkap} untuk hadiah ${row.nama_hadiah}? Status peserta akan kembali menjadi 'Belum Menang' dan stok hadiah akan dikembalikan.`,
        confirmText: "Diskualifikasi",
        onConfirm: async () => {
            try {
            const res = await fetch(`${BACKEND_URL}/api/admin/pemenang/${row.id_pemenang}/diskualifikasi`, {
                method: "DELETE",
                headers: authHeader,
            });
            const json = await res.json();

            if (json.success) {
                showSnackbar({ message: json.message, severity: "success" });
                fetchPemenang();
            } else {
                showSnackbar({ message: json.error, severity: "error" });
            }
            } catch (err) {
            showSnackbar({ message: "Terjadi kesalahan server", severity: "error" });
            }
        }
        });
    };

    return (
        <ThemeProvider theme={theme}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2, md: 0 } }}>
            
            {/* HEADER */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon fontSize="large" sx={{ color: "secondary.main" }} />
                Data Pemenang
            </Typography>
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
                size="small" 
                displayEmpty 
                value={selectedHadiah}
                onChange={(e) => { setSelectedHadiah(e.target.value); setPage(1); }}
                sx={{ flex: { xs: "1 1 100%", md: "0 1 250px" }, borderRadius: "8px" }}
            >
                <MenuItem value=""><em>Semua Hadiah</em></MenuItem>
                {hadiahList.map((h) => (
                <MenuItem key={h.id_hadiah} value={h.id_hadiah}>{h.nama_hadiah}</MenuItem>
                ))}
            </Select>
            </AppFilterBar>

            {/* TABEL DATA PEMENANG */}
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
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "20%", py: 2, textAlign: "center" }}>Hadiah</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600, width: "15%", py: 2, textAlign: "center" }}>Aksi</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pemenang.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>Belum ada data pemenang.</Typography>
                        </TableCell>
                    </TableRow>
                    ) : (
                    pemenang.map((row, index) => (
                        <TableRow 
                        key={row.id_pemenang} 
                        hover 
                        onClick={() => handleView(row)} 
                        sx={{ cursor: "pointer" }}
                        >
                        <TableCell align="center">{(page - 1) * limit + index + 1}</TableCell>
                        <TableCell>{row.nip}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{row.nama_lengkap}</TableCell>
                        <TableCell>{row.nama_divisi || "-"}</TableCell>
                        <TableCell align="center">
                            <Chip 
                            label={row.nama_hadiah} 
                            color="secondary" 
                            size="small" 
                            sx={{ fontWeight: "bold" }} 
                            />
                        </TableCell>
                        <TableCell align="center">
                            <IconButton 
                            size="small" 
                            color="error" 
                            onClick={(e) => handleDiskualifikasi(row, e)} 
                            sx={{ bgcolor: "rgba(211,47,47,0.1)" }}
                            title="Diskualifikasi"
                            >
                            <DeleteIcon fontSize="small" />
                            </IconButton>
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
            
            {/* MODAL VIEW DETAIL PEMENANG */}
            <AppDialog open={viewDialog.open} onClose={viewDialog.closeDialog} title="Detail Kemenangan">
            {viewData && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 1.5 }}>
                    <Typography color="text.secondary" fontWeight={600}>ID Pemenang</Typography>
                    <Typography fontWeight={700}>: {viewData.id_pemenang}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>NIP</Typography>
                    <Typography fontWeight={700}>: {viewData.nip}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>Nama</Typography>
                    <Typography fontWeight={700} color="primary.main">: {viewData.nama_lengkap}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>Divisi</Typography>
                    <Typography fontWeight={700}>: {viewData.nama_divisi || "-"}</Typography>

                    <Typography color="text.secondary" fontWeight={600}>Tgl Lahir</Typography>
                    <Typography fontWeight={700}>: {viewData.tgl_lahir ? new Date(viewData.tgl_lahir).toLocaleDateString("id-ID") : "-"}</Typography>
                    
                    <Typography color="text.secondary" fontWeight={600}>Mode Undian</Typography>
                    <Typography fontWeight={700} sx={{ textTransform: "capitalize" }}>: {viewData.mode_undian || "-"}</Typography>
                </Box>
                
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center", p: 2, bgcolor: "rgba(179,156,77,0.1)", borderRadius: 2, border: "1px dashed var(--color-olive)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} mb={0.5}>MENDAPATKAN HADIAH</Typography>
                    <Typography variant="h6" color="secondary.main" fontWeight={800} textalign="center">
                    {viewData.nama_hadiah}
                    </Typography>
                </Box>
                </Box>
            )}
            </AppDialog>

            {/* REUSABLE CONFIRM DIALOG (Untuk Diskualifikasi) */}
            <ConfirmDialog
            open={confirmDialog.open} onClose={closeConfirm} onConfirm={handleConfirm}
            title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={confirmDialog.cancelText}
            />

            {/* REUSABLE SNACKBAR */}
            <AppSnackbar
            open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} anchorOrigin={snackbar.anchorOrigin} onClose={closeSnackbar}
            />
        </Box>
        </ThemeProvider>
    );
}