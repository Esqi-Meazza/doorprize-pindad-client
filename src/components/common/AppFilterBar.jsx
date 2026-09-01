import { Paper, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function AppFilterBar({
    searchInput,
    setSearchInput,
    onSearch,
    onReset,
    placeholder = "Cari...",
    children, 
}) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
        onSearch();
        }
    };

    return (
        <Paper 
        elevation={0} 
        sx={{ p: 2, borderRadius: 2, border: "1px solid rgba(8,65,92,0.1)", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
        >
        <TextField
            size="small"
            placeholder={placeholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: { xs: "1 1 100%", md: "1 1 300px" }, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                    )
                }
            }}
        />
        
        <Button variant="contained" color="primary" onClick={onSearch} sx={{ borderRadius: "8px" }}>
            Cari
        </Button>
        
        {children}

        <Button 
            variant="text" 
            color="inherit" 
            startIcon={<RestartAltIcon />} 
            onClick={onReset} 
            sx={{ color: "text.secondary", fontWeight: 600 }}
        >
            Reset
        </Button>
        </Paper>
    );
}