import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import LoadingSpinner from "./components/ui/LoadingSpinner.jsx";
import AppErrorBoundary from "./components/common/AppErrorBoundary.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen message="Memuat halaman..." />}>
          <AppRoutes />
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
