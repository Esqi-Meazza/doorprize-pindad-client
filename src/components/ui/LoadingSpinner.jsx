import { CircularProgress } from "@mui/material";

export default function LoadingSpinner({
  fullScreen = false,
  inline = false,
  direction = "column",
  message = "",
  size = 40,
  className = "",
}) {
  const spinnerContent = (
    <div
      className={
        direction === "row"
          ? "flex items-center justify-center gap-2.5"
          : "flex flex-col items-center justify-center gap-3"
      }
    >
      <CircularProgress
        size={size}
        sx={{
          color: "var(--color-biru, #08415c)",
          flexShrink: 0,
        }}
      />

      {message && (
        <span className="text-sm font-medium text-gray-600 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  if (inline) {
    return (
      <div className={`flex items-center ${className}`}>
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className={`flex w-full items-center justify-center p-4 ${className}`}>
      {spinnerContent}
    </div>
  );
}