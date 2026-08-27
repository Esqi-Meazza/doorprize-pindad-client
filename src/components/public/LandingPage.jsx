import { useState, useEffect } from "react";
import Picker from "react-mobile-picker";
import { useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import pindad from "../../assets/element/pindad.webp";
import orang from "../../assets/element/orang.webp";
import "./landingPage.css"; 
import { BACKEND_URL } from "../../config/socket.js";

const years = Array.from({ length: 100 }, (_, i) => `${2026 - i}`);
const monthMap = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", Mei: "05", Jun: "06",
  Jul: "07", Agu: "08", Sep: "09", Okt: "10", Nov: "11", Des: "12"
};
const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export default function LandingPage() {
  const [isActive, setIsActive] = useState(() => {
    const savedState = sessionStorage.getItem("page_is_active");
    return savedState === "true"; 
  });
  
  const [value, setValue] = useState({
    day: "1",
    month: "Jan",
    year: "2000",
  });
  const [open, setOpen] = useState(false);

  const [nip, setNip] = useState(() => {
    return sessionStorage.getItem("login_nip") || "";});
  const [tgl_lahir, setTgl_lahir] = useState(() => {
    return sessionStorage.getItem("login_tgl_lahir") || "";});
  const [nama, setNama] = useState("");
  const [divisi, setDivisi] = useState("");

  const [isAutofillLoading, setIsAutofillLoading] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();

  const handleSikatClick = () => setIsActive(true);
  const handelResetClick = () => setIsActive(false);

  useEffect(() => {
    sessionStorage.setItem("page_is_active", isActive);
  }, [isActive]);

  useEffect(() => {
    const hasRegistered = localStorage.getItem('hasRegistered');
    if (hasRegistered === 'true') navigate("/doorprize"); 
  }, [navigate]);

  useEffect(() => {
    sessionStorage.setItem("login_nip", nip);
  }, [nip]);

  useEffect(() => {
    sessionStorage.setItem("login_tgl_lahir", tgl_lahir);
  }, [tgl_lahir]);

  useEffect(() => {
    const fetchAutofill = async () => {
      if (nip.trim() !== "" && tgl_lahir.trim() !== "") {
        setNama("");
        setDivisi("");
        setIsAutofillLoading(true);
        try {
          const [response] = await Promise.all([
            fetch(`${BACKEND_URL}/api/autofill`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nip, tgl_lahir }),
            }),
            new Promise((resolve) => setTimeout(resolve, 1200))
          ]);

          const resData = await response.json();

          if (response.ok) {
            setNama(resData.data.nama_lengkap);
            setDivisi(resData.data.nama_divisi);
            setSnackbar({ open: true, message: `Halo, ${resData.data.nama_lengkap}!`, severity: "success" });
          } else {
            setNama("Data tidak ditemukan");
            setDivisi("Data tidak ditemukan");
            setSnackbar({ open: true, message: "NIP/Tanggal lahir tidak ditemukan", severity: "warning" });
          }
        } catch {
          setNama("Gagal terhubung ke server");
          setDivisi("Gagal terhubung ke server");
          setSnackbar({ open: true, message: "Terjadi kesalahan server!", severity: "error" });
        } finally {
          setIsAutofillLoading(false);
        }
      } else {
        setNama("");
        setDivisi("");
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAutofill();
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [nip, tgl_lahir]); 

  // LOGIKA SUBMIT
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (nama === "Data tidak ditemukan" || !nama) {
    setSnackbar({ open: true, message: "Pastikan data anda sudah sesuai atau Hubungi Admin!", severity: "error" });
    return;
  }

  setIsLoadingSubmit(true);

  try {
    const response = await fetch(`${BACKEND_URL}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nip, tgl_lahir }),
    });

    const resData = await response.json();

    if (response.ok) {
      setSnackbar({ open: true, message: `Selamat datang, ${nama}!`, severity: "success" });

      const userData = {
        id_user: resData.data.id_user,
        nama_lengkap: nama,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('hasRegistered', 'true');
      localStorage.setItem('id_user', resData.data.id_user);
      sessionStorage.removeItem("page_is_active");
      sessionStorage.removeItem("login_nip");
      sessionStorage.removeItem("login_tgl_lahir");

      setTimeout(() => navigate("/doorprize"), 1000);
    } else {
      setSnackbar({ open: true, message: resData.error, severity: "error" });
    }
      } catch {
        setSnackbar({ open: true, message: "Terjadi kesalahan server!", severity: "error" });
      } finally {
        setIsLoadingSubmit(false);
      }
    };

  return (

        // BAGIAN SPLIT CONTAINER (KIRI + KANAN)

    <div className={`split-container ${isActive ? "bg-biru" : "bg-putih"}`}>
      <img src={pindad} alt="Logo Pindad" className="absolute z-20 w-11 lg:w-20 top-6 left-4 lg:top-12 lg:left-9" />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={2000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '50px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <div className="center-flex relative flex-1 bg-transparent max-md:w-full max-md:h-[50%] max-md:p-9.5">
        <div className="text-left z-1">
          <h1 className="title-spin font-extrabold text-biru text-[2.8rem] md:text-7xl mb-2 md:mb-6">DOORPRIZE</h1>
          <p className="subtitle-spin max-w-full md:max-w-95 font-semibold text-biru text-3 md:text-md mb-5 md:mb-7">Login ke akun mu untuk menguji keburuntungan mu dalam event doorprize dari <strong>PT. Pindad (Persero)</strong></p>
          <button
          className="btn-sikat rounded-pill animate-bounce bg-biru text-white cursor-pointer font-extrabold border-none md:mt-5 md:py-4 md:px-12 md:text-[1.5rem] py-2.5 px-5 text-[1.1rem]" onClick={handleSikatClick}>
            Login Sekarang
          </button>
        </div>
      </div>

            {/* PANEL FORM LOGIN */}

      <div className="center-flex relative flex-1 bg-transparent max-md:w-full max-md:h-[50%] max-md:p-9.5">
        <div className="form-content">
          <button className="btn-kembali" onClick={handelResetClick}>← kembali</button>
          <h2 className="text-white text-center font-extrabold md:text-[2.5rem] md:mb-7.5 text-[1.2rem] mb-6">LOGIN</h2>
          
          <form onSubmit={handleSubmit} className="register-form">

            <div className="input-group">
              <input type="text" placeholder="NIP" value={nip} onChange={(e) => setNip(e.target.value)} required />
              <BadgeOutlinedIcon className="input-icon" fontSize="large"/>
            </div>

              <div className="input-group"> 
                <button type="button" className="btn-submit btn-date-picker rounded-pill bg-white text-biru cursor-pointer font-extrabold active:scale-95 md:p-4 md:text-[1.2rem] md:mt-2.5 p-2.5 text-md mt-1.5" onClick={() => setOpen   (true)}>
                  <span className="text-biru text-[0.88rem] md:text-[1.2rem] font-bold">
                    Tanggal lahir : {value.day} {value.month} {value.year}
                  </span>
                  <CalendarMonthIcon className="input-icon" fontSize="large" />
                </button>
            </div>

              <Drawer
                anchor="bottom"
                open={open}
                onClose={() => setOpen(false)}
              >
                <Box p={3}>
                  <Typography variant="h6" mb={2} sx={{ fontWeight: 'bold', color: 'var(--color-biru)', textAlign: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--color-biru)' }}>
                    TANGGAL LAHIR
                  </Typography>
                  <Picker value={value} onChange={setValue} wheelMode="normal">
                    <Picker.Column name="day">
                      {days.map((day) => (
                        <Picker.Item key={day} value={day}>
                          {day}
                        </Picker.Item>
                      ))}
                    </Picker.Column>

                    <Picker.Column name="month">
                      {Object.keys(monthMap).map((month) => (
                        <Picker.Item key={month} value={month}>
                          {month}
                        </Picker.Item>
                      ))}
                    </Picker.Column>

                    <Picker.Column name="year">
                      {years.map((year) => (
                        <Picker.Item key={year} value={year}>
                          {year}
                        </Picker.Item>
                      ))}
                    </Picker.Column>
                  </Picker>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: 'var(--color-biru)', color: 'var(--color-white)', fontWeight: 'bold', padding: '16px', fontSize: '1rem'}}
                    onClick={() => {
                      setTgl_lahir(`${value.year}-${monthMap[value.month]}-${value.day}`);
                      setOpen(false);
                    }}
                  >
                    Simpan
                  </Button>
                </Box>
              </Drawer>

            <div className="input-group" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={isAutofillLoading ? "" : "Nama (Otomatis)"} 
              value={nama}
              required
              readOnly 
            />
            
            {isAutofillLoading && (
              <div style={{ 
                position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', 
                display: 'flex', alignItems: 'center', gap: '10px', color: 'gray', pointerEvents: 'none' 
              }}>
                <CircularProgress size={20} color="inherit" />
                <span style={{ fontSize: '14px' }}>Mencari data...</span>
              </div>
            )}

            <PersonIcon className="input-icon" fontSize="large"/>
          </div>

                    <div className="input-group" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={isAutofillLoading ? "" : "Divisi (Otomatis)"} 
              value={divisi}
              required
              readOnly 
            />
            
            {/* TRIK OVERLAY untuk Divisi */}
            {isAutofillLoading && (
              <div style={{ 
                position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', 
                display: 'flex', alignItems: 'center', gap: '10px', color: 'gray', pointerEvents: 'none' 
              }}>
                <CircularProgress size={20} color="inherit" />
                <span style={{ fontSize: '14px' }}>Mencari data...</span>
              </div>
            )}

            <Diversity3Icon className="input-icon" fontSize="large"/>
          </div>

            <button type="submit" className="btn-submit bg-white text-biru cursor-pointer font-extrabold rounded-pill active:scale-95 md:p-4 md:text-[1.2rem] md:mt-2.5 p-2.5 text-md mt-1.5" disabled={isLoadingSubmit}>
              {isLoadingSubmit ? "MENYIMPAN DATA..." : "LOGIN SEKARANG"}
            </button>
          </form>

        </div>
      </div>
      
      <div className={`panel-overlay ${isActive ? "active" : ""}`}>
        <img src={orang} alt="Ilustrasi" className="w-[85%] max-w-80 h-auto z-10 md:w-full md:max-w-150"/>
      </div>
    </div>
  );
}