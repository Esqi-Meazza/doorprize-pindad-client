import { CircularProgress } from '@mui/material';

export default function LoadingSpinner({ fullScreen = false, message = "", size = 40 }) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <CircularProgress size={size} sx={{ color: 'var(--color-biru, #08415c)' }} />
      {message && (
        <span className="text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );

  // Jika fullScreen, spinner menutupi seluruh layar dengan latar agak transparan
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-9999 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  // Jika tidak, tampil biasa di dalam container parent-nya
  return (
    <div className="flex w-full items-center justify-center p-4">
      {spinnerContent}
    </div>
  );
}