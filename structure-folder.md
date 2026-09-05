# Struktur Folder Client

Dokumentasi ini disesuaikan dengan isi aktual folder `client/src`.

```text
client/
├── index.html
├── vite.config.js
├── scripts/
│   └── dev-reset.mjs
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── SlidingAnimation.css
│   ├── assets/
│   │   ├── audio/
│   │   │   ├── Sound.mp3
│   │   │   └── win.mp3
│   │   ├── element/
│   │   │   ├── loginBackground.webp
│   │   │   ├── orang.webp
│   │   │   └── pindad.webp
│   │   └── font/
│   │       └── Satoshi-Variable.ttf
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppFilterBar.jsx
│   │   │   ├── AppPagination.jsx
│   │   │   ├── Boxgrid.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   └── ui/
│   │       ├── AppDatePicker.jsx
│   │       ├── AppDialog.jsx
│   │       ├── AppInput.jsx
│   │       ├── AppSnackbar.jsx
│   │       ├── button.jsx
│   │       ├── LoadingSkeleton.jsx
│   │       └── LoadingSpinner.jsx
│   ├── config/
│   │   └── socket.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useConfirmDialog.js
│   │   ├── useDialog.js
│   │   ├── useLoading.js
│   │   └── useSnackbar.js
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── lib/
│   │   └── utils.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Hadiah.jsx
│   │   │   ├── KelompokHadiah.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MainEvent.jsx
│   │   │   ├── Pemenang.jsx
│   │   │   ├── Peserta.jsx
│   │   │   ├── ProjectorDisplay.jsx
│   │   │   └── Setting.jsx
│   │   └── public/
│   │       ├── LandingPage.jsx
│   │       └── display/
│   │           ├── Background.jsx
│   │           ├── Header.jsx
│   │           ├── Standbye.jsx
│   │           └── index.jsx
│   └── routes/
│       ├── AppRoutes.jsx
│       └── ProtectedRoute.jsx
└── dist/ (hasil build Vite, diabaikan dari dokumentasi utama)
```

## Penjelasan per layer

### Layer entry dan bootstrap
- `src/App.jsx` — membungkus aplikasi dengan `BrowserRouter` dan memanggil router utama.
- `src/main.jsx` — entry point React yang memasang `StrictMode`, `AuthProvider`, dan merender aplikasi ke DOM.
- `index.html` — shell HTML utama tempat Vite mengisi elemen root.
- `vite.config.js` — konfigurasi bundler dan server Vite.
- `scripts/dev-reset.mjs` — helper untuk mereset proses development Vite.

### Layer routing dan layout
- `src/routes/AppRoutes.jsx` — mendefinisikan route publik, halaman login admin, halaman admin, dan halaman projector.
- `src/routes/ProtectedRoute.jsx` — memvalidasi token JWT admin sebelum route terlindungi dapat diakses.
- `src/layouts/AdminLayout.jsx` — shell dashboard admin yang menyediakan sidebar, navigasi, logout, dan `Outlet` untuk konten halaman.

### Layer pages / screen
- `src/pages/public/LandingPage.jsx` — halaman check-in peserta menggunakan NIP dan tanggal lahir.
- `src/pages/public/display/index.jsx` — tampilan doorprize publik yang mengambil status panggung dan menerima event Socket.IO.
- `src/pages/public/display/Background.jsx` — background SVG untuk layar doorprize.
- `src/pages/public/display/Header.jsx` — header display publik, identitas peserta, QR dialog, dan logout.
- `src/pages/public/display/Standbye.jsx` — tampilan standby sebelum pengundian dimulai.
- `src/pages/admin/Login.jsx` — form autentikasi admin.
- `src/pages/admin/Dashboard.jsx` — statistik peserta, hadiah, progres acara, dan pemenang terbaru.
- `src/pages/admin/MainEvent.jsx` — pemilihan kelompok/sesi dan kontrol event undian.
- `src/pages/admin/Peserta.jsx` — CRUD peserta, filter, dan pagination.
- `src/pages/admin/Pemenang.jsx` — daftar pemenang, filter, detail, dan diskualifikasi pemenang.
- `src/pages/admin/Hadiah.jsx` — CRUD hadiah, stok, kelompok hadiah, filter, dan pagination.
- `src/pages/admin/KelompokHadiah.jsx` — CRUD kelompok atau sesi hadiah, status, urutan sesi, dan target pemenang.
- `src/pages/admin/ProjectorDisplay.jsx` — tampilan projector untuk kontrol visual dan audio undian secara realtime.
- `src/pages/admin/Setting.jsx` — pengaturan dan reset event.

### Layer components reusable
- `src/components/common/` — komponen umum lintas halaman seperti filter bar, pagination, grid kartu undian, dan dialog konfirmasi.
- `src/components/ui/` — komponen UI dasar seperti input, date picker, dialog, snackbar, tombol, skeleton loading, dan spinner.
- `src/components/ui/button.jsx` — komponen tombol reusable berbasis Base UI dengan variasi tampilan dan ukuran.

### Layer state dan komunikasi
- `src/context/AuthContext.jsx` — state autentikasi admin/peserta dan penyimpanan sesi pada `localStorage`.
- `src/config/socket.js` — menentukan `BACKEND_URL` dan membuat instance Socket.IO client.
- `src/hooks/useConfirmDialog.js` — state dan aksi untuk dialog konfirmasi.
- `src/hooks/useDialog.js` — state buka/tutup dialog sederhana.
- `src/hooks/useLoading.js` — state loading dan wrapper untuk fungsi asynchronous.
- `src/hooks/useSnackbar.js` — state serta helper notifikasi snackbar.
- `src/lib/utils.js` — utilitas class name `cn` untuk menggabungkan class CSS.

### Layer asset dan styling
- `src/assets/element/` — logo, gambar background login, dan gambar ilustrasi.
- `src/assets/font/` — font `Satoshi` yang digunakan aplikasi.
- `src/assets/audio/` — audio efek spin dan audio kemenangan.
- `src/index.css` — import Tailwind, font, token tema, dan utility CSS global.
- `src/SlidingAnimation.css` — styling animasi panel pada halaman landing page.

> Catatan: folder `dist/` dibuat oleh `npm run build` sebagai output produksi. Folder ini bukan source utama dan sebaiknya tidak dimasukkan ke kontrol versi.
