import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../../config/socket.js';
import useSnackbar from "../../hooks/useSnackbar.js";
import AppSnackbar from "../../components/ui/AppSnackbar.jsx";
import AppInput from "../../components/ui/AppInput.jsx";

import PersonIcon from '@mui/icons-material/Person';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import loginBackground from '../../assets/element/loginBackground.webp';

export default function AdminLogin() {
  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem("login_username") || "";});
  const [password, setPassword] = useState(() => {
    return sessionStorage.getItem("login_password") || "";});

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem("login_username", username);
  }, [username]);

  useEffect(() => {
    sessionStorage.setItem("login_password", password);
  }, [password]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
      showSnackbar({
        message: "login Berhasil!",
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
      sessionStorage.removeItem("login_username");
      sessionStorage.removeItem("login_password");
      navigate("/admin/dashboard"); 
    } else {
      showSnackbar({
        message: data.error,
        severity: "error",
        anchorOrigin: { vertical: 'top', horizontal: 'center'}
      })
    }
  } catch {
    showSnackbar({
      message: "Gagal terhubung ke server. Pastikan server menyala!",
      severity: "warning",
      anchorOrigin: { vertical: 'top', horizontal: 'center'}
    })
  } finally {
    setIsLoading(false); 
  }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center w-screen p-5 bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        anchorOrigin={snackbar.anchorOrigin}
        duration={snackbar.duration}
        onClose={closeSnackbar}
        sx={{
          width: 'auto'
        }}
      />

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
          <div>
            <AppInput
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              icon={<PersonIcon sx={{color:"olive"}} />}
            />
          </div>

          <div className="relative my-5">
            <AppInput
              type={showPassword ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-12"
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer p-0"
                >
                  {showPassword ? (
                    <VisibilityIcon sx={{ color: "olive" }} />
                  ) : (
                    <VisibilityOffIcon sx={{ color: "olive" }} />
                  )}
                </button>
              }
            />
          </div>

          <div className="input-group flex items-center justify-center">
          <button
            disabled={isLoading} 
            className="
              login-submit-btn 
              w-80
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
          </div>
          
        </form>
      </div>
    </div>
  );
}