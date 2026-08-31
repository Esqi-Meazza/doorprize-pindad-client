import { useState, useEffect } from "react";
import Picker from "react-mobile-picker";
import { useNavigate } from "react-router-dom";
import AppSnackbar from "../../components/ui/AppSnackbar.jsx";
import useSnackbar from "../../hooks/useSnackbar.js";
import { BACKEND_URL } from "../../config/socket.js";

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
import "../../SlidingAnimation.css"; 

  const inputIconSx = {
    position: 'absolute',
    right: 25,
    color: 'var(--color-olive)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '@media (max-width: 768px)': {
      fontSize: '1.5rem !important',
      right: 15,
    },
  };

  const inputBaseClass =
  "w-full bg-white border-none rounded-pill pt-4 pb-4 pl-6 pr-16.5" +
  "text-xl font-bold text-biru outline-none [font-family:inherit] box-border " +
  "placeholder:text-biru " +
  "max-md:py-2 max-md:px-4 max-md:text-sm";

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
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

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
            showSnackbar({
              message: `Halo, ${resData.data.nama_lengkap}!`,
              anchorOrigin: { vertical: 'top', horizontal: 'center' },
            });
          } else {
            setNama("Data tidak ditemukan");
            setDivisi("Data tidak ditemukan");
            showSnackbar({
              message: "NIP/Tanggal lahir tidak ditemukan",
              severity: "warning",
              anchorOrigin: { vertical: 'top', horizontal: 'center' },
            });
          }
        } catch {
          setNama("Gagal terhubung ke server");
          setDivisi("Gagal terhubung ke server");
          showSnackbar({
            message: "Terjadi kesalahan server!",
            severity: "error",
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          });
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
  }, [nip, tgl_lahir, showSnackbar]); 

  // LOGIKA SUBMIT
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (nama === "Data tidak ditemukan" || !nama) {
    showSnackbar({
      message: "Pastikan data anda sudah sesuai atau Hubungi Admin!",
      severity: "error",
      anchorOrigin: { vertical: 'top', horizontal: 'center' },
    });
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
      showSnackbar({
        message: `Selamat datang, ${nama}!`,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });

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
      showSnackbar({
        message: resData.error,
        severity: "error",
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
    }
      } catch {
        showSnackbar({
          message: "Terjadi kesalahan server!",
          severity: "error",
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } finally {
        setIsLoadingSubmit(false);
      }
    };

  return (

        // BAGIAN SPLIT CONTAINER (KIRI + KANAN)

    <div className={`relative w-full h-screen flex overflow-hidden smooth-transition max-md:flex-col ${isActive ? "bg-biru" : "bg-white"}`}>
      <img src={pindad} alt="Logo Pindad" className="absolute z-20 w-11 lg:w-20 top-6 left-4 lg:top-12 lg:left-9" />
      
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        anchorOrigin={snackbar.anchorOrigin}
        duration={snackbar.duration}
        onClose={closeSnackbar}
      />

      <div className="center-flex relative flex-1 bg-transparent max-md:w-full max-md:h-[50%] max-md:p-9.5">
        <div className="text-left z-1">
          <h1 className="title-spin font-extrabold text-biru text-[2.8rem] md:text-7xl mb-2 md:mb-6">DOORPRIZE</h1>
          <p className="subtitle-spin max-w-full md:max-w-95 font-semibold text-biru text-3 md:text-md mb-5 md:mb-7">Login ke akun mu untuk menguji keburuntungan mu dalam event doorprize dari <strong>PT. Pindad (Persero)</strong></p>
          <button
          className="btn-sikat rounded-pill animate-bounce bg-biru text-white cursor-pointer font-extrabold border-none md:mt-5 md:py-4 md:px-12 md:text-2xl py-2.5 px-5 text-[1.1rem]" onClick={handleSikatClick}>
            Login Sekarang
          </button>
        </div>
      </div>

            {/* PANEL FORM LOGIN */}

      <div className={`center-flex relative flex-1 bg-transparent max-md:w-full max-md:h-[50%] max-md:p-9.5`}>
        <div className="w-full max-w-70 md:max-w-100 z-1 ">
          <button className={`btn-kembali bg-biru text-white font-semibold cursor-pointer text-sm  ${isActive
      ? "opacity-100 pointer-events-auto"
      : "opacity-0 pointer-events-none"
    }`} onClick={handelResetClick}>← kembali</button>
          <h2 className="text-white text-center font-extrabold md:text-[2.5rem] md:mb-7.5 text-xl mb-6">LOGIN</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-5">

            <div className="input-group relative flex items-center">
              <input type="text" placeholder="NIP" value={nip} onChange={(e) => setNip(e.target.value)} className={inputBaseClass} required />
              <BadgeOutlinedIcon sx={inputIconSx} fontSize="large"/>
            </div>

            <div className="input-group relative flex items-center"> 
              <button type="button" className="
              btn-submit btn-date-picker rounded-pill w-full
              flex items-center justify-self-start text-left relative
              md:p-4 p-2.5 bg-white text-biru 
              cursor-pointer active:scale-99 smooth-transition
              " 
              onClick={() => setOpen   (true)}>
                <span className="text-biru text-sm md:text-md font-bold">
                  Tanggal lahir : {value.day} {value.month} {value.year}
                </span>
                <CalendarMonthIcon fontSize="large" sx={{position: 'absolute', color: 'var(--color-olive)', right: 25, top: '50%', transform: 'translateY(-50%)', '@media (max-width: 768px)': {right: 16, fontSize: '1.5rem'},}}/>
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

            <div className="input-group relative flex items-center" style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={isAutofillLoading ? "" : "Nama (Otomatis)"} 
              value={nama}
              required
              readOnly 
              className={inputBaseClass}
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

            <PersonIcon sx={inputIconSx} fontSize="large"/>
          </div>

                    <div className="input-group relative flex items-center">
            <input 
              type="text" 
              placeholder={isAutofillLoading ? "" : "Divisi (Otomatis)"} 
              value={divisi}
              required
              readOnly 
              className={inputBaseClass}
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

            <Diversity3Icon sx={inputIconSx} fontSize="large"/>
          </div>

            <button type="submit" className="btn-submit bg-white text-biru cursor-pointer font-extrabold rounded-pill active:scale-95 md:text-xl md:mt-2.5 p-2.5 text-md mt-1.5 hover:border-golden border-4 border-white hover:border-4 smooth-transition" disabled={isLoadingSubmit}>
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