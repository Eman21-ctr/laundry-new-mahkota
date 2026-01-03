# Panduan Deployment - Laundry New Mahkota

Aplikasi ini dibangun menggunakan **Vite + React** dan menggunakan **Supabase** sebagai backend. Berikut adalah langkah-langkah untuk mendeploy aplikasi ini ke internet secara gratis menggunakan Netlify atau Vercel.

---

## 1. Persiapan Environment Variables

Ini adalah langkah paling krusial. Anda perlu menyiapkan dua kunci API dari Supabase Dashboard:

1.  Buka **Supabase Dashboard** > **Project Settings** > **API**.
2.  Ambil data berikut:
    *   `Project URL` (untuk `VITE_SUPABASE_URL`)
    *   `anon public` (untuk `VITE_SUPABASE_ANON_KEY`)

---

## 2. Deploy ke Vercel (Rekomendasi)

Vercel sangat mudah digunakan karena terintegrasi langsung dengan GitHub.

1.  Masuk ke [Vercel](https://vercel.com/) menggunakan akun GitHub Anda.
2.  Klik **"Add New"** > **"Project"**.
3.  Pilih repository `laundry-new-mahkota`.
4.  Pada bagian **Environment Variables**, tambahkan:
    *   `VITE_SUPABASE_URL`: (Isi dengan URL Supabase Anda)
    *   `VITE_SUPABASE_ANON_KEY`: (Isi dengan Anon Key Supabase Anda)
5.  Klik **"Deploy"**.
6.  Selesai! Vercel akan memberikan link otomatis (misal: `laundry-new-mahkota.vercel.app`).

---

## 3. Deploy ke Netlify

1.  Masuk ke [Netlify](https://www.netlify.com/) menggunakan akun GitHub.
2.  Klik **"Add new site"** > **"Import an existing project"**.
3.  Pilih GitHub dan pilih repository Anda.
4.  Pada **Build settings**:
    *   Build command: `npm run build`
    *   Publish directory: `dist`
5.  Klik **"Site configuration"** > **"Environment variables"** (atau masukkan saat proses import).
6.  Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
7.  Klik **"Deploy site"**.

---

## 4. Konfigurasi PWA (Opsional)

Aplikasi ini sudah mendukung PWA. Agar fitur "Install App" muncul di HP:
*   Aplikasi **WAJIB** menggunakan HTTPS (Vercel/Netlify sudah otomatis HTTPS).
*   Pastikan `public/manifest.json` dan ikon-ikon di folder `public` sudah benar.

---

## 5. Tips Keamanan

> [!IMPORTANT]
> Jangan pernah membagikan file `.env` atau `.env.local` ke GitHub atau orang lain. Selalu gunakan fitur **Environment Variables** di dashboard provider hosting Anda.

> [!TIP]
> Setiap kali Anda melakukan `git push` ke GitHub, Vercel atau Netlify akan otomatis melakukan update aplikasi (Auto-deploy).

---

Aplikasi siap digunakan di mana saja, bosku! 🚀🔥
