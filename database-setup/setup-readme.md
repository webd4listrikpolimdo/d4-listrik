# Panduan Inisialisasi Database - D4 Teknik Listrik

Direktori ini berisi skrip SQL terstruktur untuk menginisialisasi database PostgreSQL di Supabase dari awal secara bersih dan modular.

## Urutan Eksekusi Skrip

Jalankan skrip-skrip berikut secara berurutan di dalam **Supabase SQL Editor** (Dashboard > SQL Editor):

1. **`01-extensions-functions.sql`**
   - Mengaktifkan ekstensi database (`uuid-ossp`).
   - Mendefinisikan fungsi pembantu global seperti otentikasi peran (`get_user_role`) dan penanganan trigger waktu (`update_updated_at_column`).

2. **`02-schema.sql`**
   - Membuat seluruh 24 tabel beserta kolom, tipe data, primary key, check constraints, dan relasi foreign key secara berurutan sesuai dependensinya.

3. **`03-triggers.sql`**
   - Menerapkan fungsi trigger waktu otomatis untuk memperbarui nilai kolom `updated_at` pada semua tabel ketika terjadi mutasi data.

4. **`04-rls-policies.sql`**
   - Mengaktifkan Row Level Security (RLS) pada 24 tabel.
   - Menambahkan aturan otorisasi akses data (baca-tulis) untuk Pengguna Publik, Admin, Dosen, dan Pegawai.

5. **`05-storage.sql`**
   - Mendaftarkan 6 bucket penyimpanan objek publik (`galeri`, `logo`, `dosen`, `pegawai`, `kurikulum`, `heroBackground`).
   - Mengatur kebijakan RLS penyimpanan untuk akses baca publik dan manajemen file sesuai dengan hak akses masing-masing peran.

## Catatan Penting
- Disarankan untuk menjalankan skrip ini pada proyek Supabase yang masih bersih untuk menghindari konflik skema data.
- Tidak ada data dummy/mock yang dimasukkan, sehingga database siap digunakan untuk lingkungan produksi maupun pengujian bersih.
