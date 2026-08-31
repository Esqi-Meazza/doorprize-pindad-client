# Struktur Folder Client

```text
client/
├── .gitignore
├── .oxlintrc.json
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── scripts/
│   └── dev-reset.mjs
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── assets/
│   │   └── element/
│   │       ├── loginBackground.webp
│   │       ├── orang.webp
│   │       ├── pindad.webp
│   │       ├── Satoshi-Variable.ttf
│   │       ├── Sound.mp3
│   │       └── win.mp3
│   ├── api/
│   ├── config/
│   │   └── socket.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── EventContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useConfrimDialog.js
│   │   ├── useDialog.js
│   │   └── useSnackbar.js
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Hadiah.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MainEvent.jsx
│   │   │   ├── Peserta.jsx
│   │   │   ├── ProjectorDisplay.jsx
│   │   │   └── Setting.jsx
│   │   └── public/
│   │       ├── LandingPage.jsx
│   │       └── display/
│   │           ├── Background.jsx
│   │           ├── Header.jsx
│   │           ├── Standby.jsx
│   │           └── index.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── SlidingAnimation.css
│   └── templates/
│       └── (jika ada seiring pengembangan)
└── dist/ (hasil build Vite, diabaikan dari dokumentasi utama)
```

## Penjelasan per layer

### Layer entry & bootstrap
- `src/App.jsx` — meng-wrap aplikasi dengan `BrowserRouter` dan memanggil router utama.
- `src/main.jsx` — entry point React yang memasang `AuthProvider` dan meng-render aplikasi ke DOM.
- `index.html` — shell HTML utama tempat aplikasi Vite mengisi root element.
- `vite.config.js` — konfigurasi bundler Vite, proxy API, dan pengaturan server dev.
- `package.json` — definisi script `dev`, `build`, lint, serta daftar dependency frontend.
- `scripts/dev-reset.mjs` — helper Windows untuk menutup port 5173 dan menjalankan Vite ulang dengan bersih.

### Layer routing & layout
- `src/routes/AppRoutes.jsx` — men-definisikan semua route publik dan admin, termasuk guard proteksi.
- `src/routes/ProtectedRoute.jsx` — memvalidasi token admin dan mengarahkan ke halaman login bila belum autentikasi.
- `src/layouts/AdminLayout.jsx` — template shell dashboard admin dengan sidebar, navigasi, dan area konten dinamis.

### Layer pages / screen
- `src/pages/public/LandingPage.jsx` — halaman cek-in peserta untuk mengisi NIP dan tanggal lahir.
- `src/pages/public/display/index.jsx` — layar display undian publik yang menghubungkan socket dan status panggung.
- `src/pages/public/display/Background.jsx` — komponen background SVG untuk tampilan undian.
- `src/pages/public/display/Header.jsx` — header tampilan doorprize, identitas user, dan tombol logout.
- `src/pages/public/display/Standby.jsx` — state menunggu sebelum pengundian dimulai.
- `src/pages/admin/Login.jsx` — form login untuk admin panel.
- `src/pages/admin/Dashboard.jsx` — statistik dashboard peserta, hadiah, dan pemenang terbaru.
- `src/pages/admin/MainEvent.jsx` — pemilihan sesi undian dan kontrol operator proyektor.
- `src/pages/admin/Peserta.jsx` — daftar peserta beserta aksi hapus data.
- `src/pages/admin/Hadiah.jsx` — daftar hadiah/doorprize dan stok yang tersedia.
- `src/pages/admin/ProjectorDisplay.jsx` — tampilan proyektor untuk acara live.
- `src/pages/admin/Setting.jsx` — tombol reset event untuk mengembalikan data ke kondisi awal.

### Layer state & komunikasi
- `src/context/AuthContext.jsx` — state global autentikasi admin/user dan helper login/logout.
- `src/context/EventContext.jsx` — konteks event-side aplikasi yang kemungkinan dipakai untuk state penjadwalan atau event runtime.
- `src/context/SocketContext.jsx` — koneksi Socket.IO yang dipusatkan untuk sinkronisasi realtime.
- `src/config/socket.js` — menentukan URL backend dan inisialisasi client socket.
- `src/hooks/useSnackbar.js` — helper reusable untuk menampilkan notifikasi snackbar.
- `src/hooks/useDialog.js` — hook untuk dialog interaktif yang sering dipakai di view admin.
- `src/hooks/useConfrimDialog.js` — hook konfirmasi aksi seperti hapus peserta atau reset event.

### Layer asset & styling
- `src/assets/element/` — menyimpan font, logo, ilustrasi, dan audio yang dipakai pada UI.
- `src/index.css` — stylesheet global, token warna, font, dan utility Tailwind foundation.
- `src/SlidingAnimation.css` — file styling khusus untuk animasi transisi panel atau efek sliding.

### Layer utility / placeholder
- `src/api/` — folder persiapan untuk wrapper komunikasi API bila ingin dipisah dari halaman.
- `src/templates/` — lokasi untuk template atau komponen reusable tambahan jika proyek berkembang.
- `README.md` — dokumentasi setup dan informasi penggunaan frontend.

> Catatan: folder `dist/` dibuat saat build produksi dan bukan bagian dari source utama, jadi disarankan tidak dimasukkan ke kontrol versi.
