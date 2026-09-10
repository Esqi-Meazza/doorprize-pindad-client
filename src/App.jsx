import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import LoadingSpinner from "./components/ui/LoadingSpinner.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner fullScreen message="Memuat halaman..." />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;