import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function AppPagination({
  page,
  setPage,
  limit,
  setLimit,
  totalPages,
  totalItems,
  loading = false,
}) {
  if (loading || totalItems === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mt: 1,
        px: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Tampilkan:
        </Typography>
        <Select
          size="small"
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            setPage(1);
          }}
          sx={{ borderRadius: "8px", height: "35px" }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          sx={{ minWidth: "40px", p: 1, borderRadius: "8px" }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> (Total: {totalItems} data)
      </Typography>
    </Box>
  );
}
