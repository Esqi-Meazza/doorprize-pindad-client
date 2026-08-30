import { useEffect, useState } from "react";
import { 
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem, 
  ListItemText,
  Box 
} from "@mui/material";
import { BACKEND_URL } from '../../../config/socket.js'; 

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalPeserta: 0, totalHadiahTersedia: 0, totalPemenang: 0 });
  const [winners, setWinners] = useState([]);
  
  const token = localStorage.getItem("admin_token");
  const authHeader = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // 1. Fetch Statistik
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers: authHeader });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Gagal ambil stats:", err);
      }
    };
    fetchStats();
  }, []);

  // 2. Fetch Winner Logs (Short Polling)
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/winners/latest`, { headers: authHeader });
        if (res.ok) {
          const data = await res.json();
          setWinners(data);
        }
      } catch (err) {
        console.error("Gagal ambil logs:", err);
      }
    };

    fetchWinners();
    const intervalId = setInterval(fetchWinners, 4000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: { xs: 3, md: 5 }, 
      p: { xs: 2, sm: 3 } 
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'var(--color-biru)', 
          fontWeight: 700,
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Dashboard
      </Typography>

      {/* WIDGET STATISTIK */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={4} md={4}>
          <Card variant="outlined" sx={{ 
            borderRadius: { xs: 2, md: 2 }, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
            borderColor: 'rgba(8,65,92,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="textSecondary" sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                Total Peserta Terdaftar
              </Typography>
              <Typography variant="h3" sx={{ 
                color: 'var(--color-golden)', 
                fontWeight: 700, 
                mt: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                {stats.totalPeserta}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card variant="outlined" sx={{ 
            borderRadius: { xs: 2, md: 2 }, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
            borderColor: 'rgba(8,65,92,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="textSecondary" sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                Total Hadiah Tersedia
              </Typography>
              <Typography variant="h3" sx={{ 
                color: 'var(--color-golden)', 
                fontWeight: 700, 
                mt: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                {stats.totalHadiahTersedia}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <Card variant="outlined" sx={{ 
            borderRadius: { xs: 2, md: 2 }, 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
            borderColor: 'rgba(8,65,92,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography color="textSecondary" sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}>
                Total Pemenang Sah
              </Typography>
              <Typography variant="h3" sx={{ 
                color: 'var(--color-golden)', 
                fontWeight: 700, 
                mt: 1,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}>
                {stats.totalPemenang}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KONTEN UTAMA */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        
        {/* WINNER LOGS FEED - DIBUAT FULL WIDTH KARENA CONTROLLER DIHAPUS */}
        <Grid item xs={12} md={12}>
          <Card variant="outlined" sx={{ 
            height: '100%', 
            borderRadius: { xs: 2, md: 2 }, 
            borderColor: 'rgba(8,65,92,0.1)' 
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ 
                color: 'var(--color-biru)', 
                fontWeight: 600, 
                borderBottom: '2px solid rgba(179,156,77,0.2)', 
                pb: 1, 
                mb: 1,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}>
                Live Winner Logs
              </Typography>
              
              <List sx={{ 
                maxHeight: { xs: 250, md: 400 }, 
                overflowY: 'auto', 
                p: 0 
              }}>
                {winners.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="Belum ada pemenang..." />
                  </ListItem>
                ) : (
                  winners.map((w, index) => (
                    <ListItem key={index} sx={{ 
                      bgcolor: '#f4f7f6', 
                      borderLeft: '4px solid var(--color-hijau)', 
                      mb: 1, 
                      borderRadius: 1,
                      p: { xs: 1, md: 2 }
                    }}>
                      <ListItemText 
                        primary={w.nama_lengkap} 
                        secondary={w.nama_hadiah}
                        primaryTypographyProps={{ 
                          fontWeight: 600, 
                          color: 'var(--color-biru)',
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                        secondaryTypographyProps={{ 
                          color: 'var(--color-oil)', 
                          fontSize: { xs: '0.75rem', md: '0.85rem' }
                        }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}