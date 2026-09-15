import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <h1 className="text-2xl font-bold text-biru">Terjadi kesalahan pada aplikasi</h1>
        <p className="max-w-md text-gray-600">
          Halaman tidak dapat ditampilkan. Muat ulang aplikasi untuk mencoba kembali.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="rounded-lg bg-biru px-5 py-3 font-bold text-white transition hover:opacity-90"
        >
          Muat Ulang
        </button>
      </main>
    );
  }
}
