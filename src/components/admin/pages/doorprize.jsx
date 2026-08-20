import { useState, useEffect } from "react";
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
  CircularProgress,
  Chip,
} from "@mui/material";
import { socket, BACKEND_URL } from "../../../config/socket.js";

// Kustomisasi Tema Material UI (Konsisten dengan peserta.jsx)
const theme = createTheme({
  palette: {
    primary: { main: "#08415c" }, // Biru
    secondary: { main: "#b39c4d" }, // Golden
    success: { main: "#157145" }, // Hijau
    error: { main: "#d32f2f" }, // Merah default MUI
  },
  typography: {
    fontFamily: "inherit", // Mengikuti Poppins global
  },
});

export default function DoorprizePage() {
  const [hadiah, setHadiah] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("admin_token");
  const authHeader = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // FETCH DATA HADIAH SAAT MOUNT
  useEffect(() => {
    const fetchHadiah = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/hadiah`, {
          headers: authHeader,
        });
        if (res.ok) {
          const data = await res.json();
          setHadiah(data);
        }
      } catch (err) {
        console.error("Gagal ambil data doorprize:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHadiah();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* HEADER HALAMAN */}
        <Typography
          variant="h4"
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          Doorprize
        </Typography>

        {/* TABEL DATA HADIAH (READ-ONLY) */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: { xs: 1, sm: 2 },
            border: "1px solid rgba(8,65,92,0.1)",
            overflowX: "hidden",
            width: "100%",
          }}
        >
          <Table
            sx={{
              width: "100%",
              tableLayout: "fixed",
            }}
          >
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: "10%",
                    textAlign: "center",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 0.5, sm: 2 },
                  }}
                >
                  No
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: "45%",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 0.5, sm: 2 },
                  }}
                >
                  Nama Hadiah
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: "25%",
                    textAlign: "center",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 0.5, sm: 2 },
                  }}
                >
                  Tipe
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    width: "20%",
                    textAlign: "center",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 0.5, sm: 2 },
                  }}
                >
                  Stok
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: { xs: 4, sm: 5 } }}
                  >
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              ) : hadiah.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: { xs: 4, sm: 6 } }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                    >
                      Belum ada data doorprize.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                hadiah.map((row, index) => (
                  <TableRow
                    key={row.id_hadiah}
                    hover
                    sx={{ opacity: row.stok === 0 ? 0.5 : 1 }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 2 },
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        color: "primary.main",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 2 },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row.nama_hadiah}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 2 },
                      }}
                    >
                      <Chip
                        label={row.tipe === "prize" ? "Prize" : "Zonk"}
                        color={row.tipe === "prize" ? "secondary" : "default"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.6rem", sm: "0.75rem" },
                          height: { xs: 20, sm: 32 },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        color: row.stok === 0 ? "error.main" : "inherit",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        py: { xs: 1, sm: 1.5 },
                        px: { xs: 0.5, sm: 2 },
                      }}
                    >
                      {row.stok}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  );
}
