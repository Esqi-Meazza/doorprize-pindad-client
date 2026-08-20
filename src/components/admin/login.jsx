import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import loginBackground from '../../assets/element/loginBackground.webp';
import { BACKEND_URL } from '../../config/socket.js';

export default function AdminLogin() {
  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem("login_username") || "";});
  const [password, setPassword] = useState(() => {
    return sessionStorage.getItem("login_password") || "";});

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem("login_username", username);
  }, [username]);

  useEffect(() => {
    sessionStorage.setItem("login_password", password);
  }, [password]);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setSnackbar({ open: false, message: "", severity: "info" });
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
      localStorage.setItem("admin_token", data.token); 
      setSnackbar({ open: true, message: "Login berhasil!", severity: "success" });
      sessionStorage.removeItem("login_username");
      sessionStorage.removeItem("login_password");
      navigate("/admin/dashboard"); 
    } else {
      setSnackbar({ open: true, message: data.error, severity: "error" });
    }
  } catch (err) {
    setSnackbar({ open: true, message: "Gagal terhubung ke server. Pastikan server menyala.", severity: "warning" });
  } finally {
    setIsLoading(false); 
  }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center w-screen p-5 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
      >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '50px' }}>
            {snackbar.message}
          </Alert>
      </Snackbar>

      <div
        className="
          w-full
          bg-biru/70
          min-w-auto
          max-w-full
          py-9
          rounded-2xl

          sm:min-w-xs
          md:px-8 md:py-11 md:max-w-xl md:max-h-fit md:rounded-2xl
          lg:px-8 lg:rounded-3xl
        ">

        <h1
          className="
          text-white
            text-center
            font-black
            tracking-wide
            text-2xl md:text-3xl
            mb-2 mx-2 md:mx-0
          ">
          Login To Admin Dashboard
        </h1>

        <form 
          onSubmit={handleLogin} 
          className="p-5">
          
          <div className="input-focus">
            <input 
              type="text" 
              placeholder="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="login-input"/>
            <PersonIcon sx={{color:"olive"}} />
          </div>

          <div
            className="input-focus">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="login-input"
            /> <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="
                  icon-button
                  center-flex
                  bg-none
                  border-none
                  cursor-pointer
                  shrink-0
                  p-0
                  ml-2.5
                ">{showPassword ? 
                  (<VisibilityIcon sx={{color:"olive"}} />) :
                  (<VisibilityOffIcon sx={{color:"olive"}} />)}
            </button>
          </div>

          <button
            disabled={isLoading} 
            className="
              login-submit-btn 
              w-full
              h-11 lg:h-12.5
              rounded-pill
              bg-white
              text-golden
              text-4 lg:text-2xl font-black tracking-widest
              border-none
              cursor-pointer
              mt-3
              transition-all duration-300 ease-in-out
              hover:shadow-[inset_0px_0px_20px_2px_rgba(71,75,36,0.50)]
              active:scale-95
              disabled:opacity-60 disabled:cursor-not-allowed
            ">
            {isLoading ? "LOADING..." : "LOGIN"}
          </button>
          
        </form>
      </div>
    </div>
  );
}