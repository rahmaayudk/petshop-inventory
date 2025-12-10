# Seven March Pet Care Inventory System

Sistem manajemen inventaris toko hewan peliharaan yang modern dengan fitur penjualan, pembelian, laporan, dan manajemen pengguna.

## 📋 Daftar Isi
- [Fitur](#fitur)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Panduan Penggunaan](#panduan-penggunaan)
- [API Endpoints](#api-endpoints)
- [Struktur Database](#struktur-database)
- [Troubleshooting](#troubleshooting)

## ✨ Fitur

### Dashboard
- 📊 Ringkasan stok dan penjualan real-time
- 📈 Grafik analitik penjualan
- 🔔 Notifikasi stok produk rendah
- 📋 Aktivitas terbaru transaksi

### Manajemen Inventaris
- ➕ Tambah/edit/hapus produk
- 📤 Import/export data Excel
- 📦 Tracking stok real-time
- ⚠️ Alert stok minimum

### Transaksi
- 🛒 Pencatatan penjualan
- 📥 Pencatatan pembelian/stok masuk
- 📝 Riwayat transaksi lengkap
- 💰 Kalkulasi otomatis profit/margin

### Laporan
- 📊 Laporan penjualan (harian/mingguan/bulanan)
- 💵 Analisis profit & margin
- 🏆 Best seller products
- 📉 Trend analisis

### Manajemen Pengguna (Admin)
- 👥 Tambah/edit/hapus pengguna
- 🔐 Role-based access (Admin/Staff)
- 📋 List pengguna aktif

### Autentikasi
- 🔐 Login dengan session-based auth
- 🚪 Logout otomatis
- 👤 Profil pengguna

## 💻 Persyaratan Sistem

### Backend
- **PHP** 7.4 atau lebih tinggi
- **MySQL/MariaDB** 5.7 atau lebih tinggi
- **XAMPP** (atau web server dengan PHP & MySQL) - untuk development

### Frontend
- **Node.js** 14.x atau lebih tinggi
- **npm** 6.x atau lebih tinggi

### Browser
- Chrome, Firefox, Safari, Edge (versi terbaru)

## 📥 Instalasi

### 1. Persiapan Folder & Database

```bash
# Clone atau extract project ke folder XAMPP
cd C:\xampp\htdocs
# Pastikan folder bernama: petshop-inventory

# Jika belum ada, buat folder:
mkdir petshop-inventory
cd petshop-inventory
```

### 2. Setup Database MySQL

#### Opsi A: Menggunakan phpMyAdmin (Rekomendasi)
1. Buka http://localhost/phpmyadmin
2. Klik "Database" → Buat database baru dengan nama: `petshop_inventory`
3. Pilih database → Tab "Import"
4. Pilih file `database/petshop_inventory.sql`
5. Klik "Go" untuk import

#### Opsi B: Menggunakan Command Line
```bash
# Buka MySQL Command Line atau terminal
mysql -u root -p

# Di MySQL prompt:
CREATE DATABASE petshop_inventory;
USE petshop_inventory;
SOURCE C:\xampp\htdocs\petshop-inventory\database\petshop_inventory.sql;
EXIT;
```

### 3. Setup Backend (PHP)

Tidak perlu instalasi package tambahan untuk backend karena sudah menggunakan native PHP PDO.

**File konfigurasi sudah siap di:**
- `backend/config/database.php` (default: localhost, user: root, password: kosong)

Jika MySQL Anda menggunakan password atau port berbeda, edit file tersebut:
```php
private $config = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '', // Ganti dengan password MySQL Anda
    'database' => 'petshop_inventory'
];
```

### 4. Setup Frontend (React)

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Atau jika menggunakan yarn:
yarn install
```

**Package utama yang akan diinstall:**
- `react` - Framework UI
- `axios` - HTTP client
- `react-toastify` - Toast notifications
- `xlsx` - Excel import/export
- `bootstrap` - CSS framework
- `react-scripts` - Build tools

## 🚀 Menjalankan Aplikasi

### Start Backend Server (PHP Built-in Server)

Buka PowerShell atau Command Prompt dan jalankan:

```powershell
# Navigate ke project root
cd C:\xampp\htdocs\petshop-inventory

# Jalankan PHP server di port 8000
php -S localhost:8000
```

Server backend akan berjalan di: **http://localhost:8000**

### Start Frontend Server (React Dev Server)

Buka terminal baru dan jalankan:

```bash
# Navigate ke folder frontend
cd C:\xampp\htdocs\petshop-inventory\frontend

# Start development server
npm start
```

Frontend akan otomatis membuka di: **http://localhost:3000**

**Atau jika ingin di port berbeda:**
```bash
PORT=3001 npm start
```

### Verifikasi Server Berjalan

1. **Backend Check:**
   ```
   Buka: http://localhost:8000/backend/index.php
   Expected: 404 dengan pesan "Endpoint tidak ditemukan" (ini normal, berarti backend active)
   ```

2. **Frontend Check:**
   ```
   Buka: http://localhost:3000
   Expected: Login page dengan form username & password
   ```

## 🔑 Login Default

```
admin role 
Username: admin
Password: admin123

staff role
username : staff
password : staff123
```

**⚠️ Untuk production, SEGERA ubah password default!**

## 📖 Panduan Penggunaan

### 1. Login

1. Buka http://localhost:3000
2. Masukkan username: `admin`
3. Masukkan password: `admin123`
4. Klik "Login" atau tekan Enter

### 2. Dashboard

**Halaman utama setelah login yang menampilkan:**
- Total stok produk
- Total penjualan hari ini
- Stok produk rendah (< minimum threshold)
- Grafik penjualan 12 bulan terakhir
- Aktivitas terbaru (5 transaksi terakhir)

**Aksi:**
- Klik "Import Excel" untuk import produk massal
- Klik "Tambah Produk" untuk tambah produk baru
- Klik "Lihat Laporan" untuk detail analitik

### 3. Manajemen Inventaris

**Menu: Inventory → Inventory**

#### Tampilan Daftar Produk
- SKU, Nama, Kategori, Hewan, Stok, Harga Beli, Harga Jual
- Badge status: AMAN (hijau), RESTOCK (kuning), HABIS (merah)

#### Aksi Per Produk
- ✏️ **Edit** - Ubah data produk
- 🗑️ **Hapus** - Hapus produk (tidak bisa dibatalkan)
- 📦 **Restock** - Input stok masuk (shortcut untuk transaksi)

#### Tombol Utama
- **Import Excel** - Import produk dari file Excel/CSV
- **Tambah Produk** - Form untuk tambah produk baru manual
- **Reset Filter** - Hapus filter pencarian

#### Filter & Pencarian
- **Cari produk** - Ketik nama/SKU untuk search
- **Filter Status** - Aman / Restock / Habis

### 4. Transaksi

**Menu: Transaksi**

#### Tambah Transaksi (Penjualan/Pembelian)
1. Klik "Tambah Transaksi"
2. Pilih **Tipe**: "Penjualan (Keluar)" atau "Pembelian (Masuk)"
3. Pilih **Produk** dari dropdown
4. Masukkan **Jumlah** (qty)
5. Masukkan **Tanggal** transaksi
6. Opsional: Tulis catatan di field "Keterangan"
7. Klik **Simpan Transaksi**

#### Riwayat Transaksi
- Tabel menampilkan semua transaksi dengan tanggal, produk, qty, tipe, dan actor
- Diurutkan dari terbaru ke tertua
- Ditampilkan maksimal 10 per page

### 5. Laporan

**Menu: Laporan**

#### Laporan Penjualan
1. Pilih **Rentang Tanggal** (From - To)
2. Klik **Generate Report**
3. Tampil: Total penjualan, margin kotor, margin netto
4. Tabel detail transaksi dengan breakdown per produk

#### Laporan Tren
- Grafik penjualan bulanan (12 bulan terakhir)
- Analisis trend naik/turun

#### Best Sellers
- Top 5 produk dengan volume penjualan tertinggi
- Menampilkan qty terjual dan revenue

### 6. Manajemen Pengguna (Admin Only)

**Menu: Penggguna**

#### Daftar Pengguna
- Tampil semua user dengan info: Username, Email, Role, Tanggal Dibuat
- Role: Admin atau Staff

#### Tambah User Baru
1. Klik "Tambah User"
2. Masukkan **Username** (unique)
3. Masukkan **Password** (min. 6 karakter)
4. Masukkan **Email** (opsional)
5. Pilih **Role**: Admin atau Staff
6. Klik **Simpan**

#### Edit User
1. Klik ✏️ pada baris user
2. Ubah field yang diperlukan
3. Klik **Update**

#### Hapus User
1. Klik 🗑️ pada baris user
2. Konfirmasi penghapusan
3. User akan dihapus permanen

### 7. Import Excel

#### Download Template
1. Klik tombol "Import Excel" di halaman Inventory
2. Klik "📥 Download Template"
3. File `template_import_produk.xlsx` akan didownload

#### Format File Excel
Kolom yang didukung:
| Kolom | Contoh | Keterangan |
|-------|--------|-----------|
| sku_code | DOG-DRY-001 | Kode unik produk (wajib) |
| name | Royal Canin Maxi Adult | Nama produk (wajib) |
| category | dry_food | dry_food, wet_food, snack, sand, barang, atau "all" |
| animal_type | dog | dog, cat, all, atau "semua hewan" |
| current_stock | 50 | Jumlah stok (boleh desimal) |
| min_stock_threshold | 10 | Batas minimum stok |
| price_buy | 250000 | Harga beli (boleh pakai . atau ,) |
| price_sell | 325000 | Harga jual |

#### Cara Import
1. Klik "Import Excel" di halaman Inventory
2. Klik "Choose File" → Pilih file Excel/CSV
3. Klik tombol "Import Data"
4. Tunggu sampai selesai (toast akan muncul)
5. Refresh halaman untuk lihat produk baru/terupdate

#### Catatan Import
- SKU yang sudah ada akan di-**update** (bukan duplikat)
- File bisa berformat: .xlsx, .xls, .csv
- Maksimal file size: 5MB
- Support nilai category: "semua kategori" akan di-map menjadi "all"
- Support nilai animal_type: "semua hewan", "kucing", "anjing" akan di-normalize

### 8. Theme & Appearance

Aplikasi sudah support **Light/Dark Mode** (akan dilanjutkan di update berikutnya).

Sidebar dan header sudah **fixed** (tidak scroll) untuk UX yang lebih baik.

## 🔌 API Endpoints

### Authentication
```
POST /auth
  action=login, username, password → Login user
  action=logout → Logout user
  action=check → Check session status
```

### Products
```
GET  /products → List semua produk
GET  /products?action=low_stock → List produk stok rendah
POST /products → Tambah/import produk (upsert by SKU)
PUT  /products → Update produk by ID
DELETE /products → Hapus produk by ID
```

### Transactions
```
POST /transactions → Tambah transaksi
GET  /transactions?action=recent&limit=10&detail=1 → List transaksi terbaru
GET  /transactions?action=best_sellers&limit=5 → Top sellers
GET  /transactions?action=sales_report&start_date=...&end_date=... → Laporan penjualan
GET  /transactions?action=growth → Growth analysis
```

### Users (Admin Only)
```
GET  /users → List semua user
POST /users → Tambah user
PUT  /users → Update user
DELETE /users → Hapus user
```

### Analytics
```
GET /analytics/customer-insights → Customer analytics
GET /analytics/inventory-turnover → Inventory turnover
GET /analytics/sales-trends?period=monthly → Sales trends
```

## 🗄️ Struktur Database

### Tabel: users
```sql
- id (INT, Primary Key)
- username (VARCHAR 50, UNIQUE)
- password (VARCHAR 255)
- email (VARCHAR 100)
- password_encrypted (VARCHAR 255)
- password_iv (VARCHAR 255)
- role (ENUM: 'admin', 'staff')
- created_at (TIMESTAMP)
```

### Tabel: products
```sql
- id (INT, Primary Key)
- sku_code (VARCHAR 50, UNIQUE)
- name (VARCHAR 255)
- category (ENUM: 'dry_food', 'wet_food', 'snack', 'sand', 'barang')
- animal_type (ENUM: 'dog', 'cat', 'all')
- current_stock (INT)
- min_stock_threshold (INT)
- price_buy (DECIMAL 10,2)
- price_sell (DECIMAL 10,2)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabel: transactions
```sql
- id (INT, Primary Key)
- product_id (INT, Foreign Key → products.id)
- type (ENUM: 'in', 'out')
- qty (INT)
- date (DATE)
- notes (TEXT)
- user_id (INT, Foreign Key → users.id)
- created_at (TIMESTAMP)
```

## 🐛 Troubleshooting

### Error: "Connection failed: Connection refused"
**Penyebab:** MySQL/XAMPP tidak berjalan

**Solusi:**
1. Buka XAMPP Control Panel
2. Klik "Start" pada MySQL
3. Tunggu hingga berwarna hijau
4. Refresh aplikasi

### Error: "404 Endpoint tidak ditemukan"
**Penyebab:** Request ke endpoint yang tidak ada atau path salah

**Solusi:**
- Pastikan URL backend benar: `http://localhost:8000/products` (bukan `/backend/products`)
- Check di browser DevTools → Network tab untuk lihat request URL
- Pastikan backend server berjalan

### Error: "Unauthorized (401)"
**Penyebab:** User belum login atau session expired

**Solusi:**
1. Refresh page (Ctrl+R)
2. Login kembali dengan credentials yang benar
3. Check browser cookies: DevTools → Application → Cookies

### Import Excel gagal / "0 gagal"
**Penyebab:** 
- File format tidak sesuai
- Nilai kategori/hewan tidak valid
- Duplikat SKU dengan data invalid

**Solusi:**
1. Download template terbaru dari aplikasi
2. Pastikan header column sesuai: sku_code, name, category, animal_type, etc.
3. Gunakan kategori: dry_food, wet_food, snack, sand, atau "all"
4. Gunakan animal_type: dog, cat, all, atau "semua hewan"
5. Check file di backend logs: `backend/logs/import_debug.log`

### Aplikasi loading terus / tidak load
**Penyebab:** 
- Server backend tidak berjalan
- Network request blocked
- CORS issue

**Solusi:**
1. Buka terminal backend check: `php -S localhost:8000`
2. Cek di DevTools → Console untuk error message
3. Pastikan port 8000 dan 3000 tidak terpakai aplikasi lain

### "Cannot find module 'react-scripts'" 
**Penyebab:** Dependencies tidak terinstall

**Solusi:**
```bash
cd frontend
npm install
npm start
```

### Produk tidak terupdate setelah import
**Penyebab:** SKU format berbeda (case-sensitive), atau file telah di-import sebelumnya

**Solusi:**
1. Pastikan SKU sama persis dengan yang ada di DB (format case-sensitive)
2. Check logs: `backend/logs/import_debug.log` untuk detail error
3. Test dengan 1 baris dulu sebelum import massal

## 📱 Device Support

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablet)
- ⚠️ Mobile Phone (responsive, tapi beberapa fitur mungkin terbatas di layar kecil)

## 📝 Lisensi & Info

- **Versi:** 1.0.0
- **Last Updated:** December 5, 2025
- **Author:** Seven March Pet Care

## 🆘 Support & Bantuan

Jika mengalami masalah:

1. **Cek logs:**
   - Backend: `backend/logs/import_debug.log`
   - Browser Console: F12 → Console tab

2. **Restart services:**
   ```bash
   # Terminal 1: Stop & restart backend
   Ctrl+C (di terminal backend)
   php -S localhost:8000

   # Terminal 2: Stop & restart frontend  
   Ctrl+C (di terminal frontend)
   npm start
   ```

3. **Clear cache:**
   - Browser: Ctrl+Shift+Delete
   - Local Storage: DevTools → Application → Local Storage → Clear all

4. **Database reset (nuclear option):**
   ```bash
   # Drop & recreate database
   mysql -u root -p
   DROP DATABASE petshop_inventory;
   CREATE DATABASE petshop_inventory;
   SOURCE database/petshop_inventory.sql;
   ```

---
created by :
kelompok 37 kerja praktek - fakultas ilmu komputer - program studi sistem informasi - universitas kuningan, angkatan 2022, thn ajaran 2025-2026.

Rafif Taufiqurrahman - 20220910062
Rahma Ayu Dwi Kartika - 20220910115
Albani Khaerullah - 20220910142

SINFC - 2022 - 05

**Happy inventory management! 🎉**
