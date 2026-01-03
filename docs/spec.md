# Laundry Cashier App - Technical Specification

## 1. Overview
Aplikasi kasir berbasis web untuk usaha laundry dengan fokus pada pengalaman mobile-first, compact design, dan kemampuan PWA (Progressive Web App). Nama usahanya adalah "Laundry New Mahkota".

---

## 2. Design System

### 2.1 Typography
- **Primary Font**: Plus Jakarta Sans
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Font Sizes**:
  - Heading 1: 24px (1.5rem)
  - Heading 2: 20px (1.25rem)
  - Heading 3: 18px (1.125rem)
  - Body: 14px (0.875rem)
  - Small: 12px (0.75rem)
  - Tiny: 11px (0.6875rem)

### 2.2 Color Scheme (Neutral + Blue Accent)
```
Primary Colors:
- Primary Blue: #3B82F6 (rgb(59, 130, 246))
- Primary Blue Dark: #2563EB (hover states)
- Primary Blue Light: #DBEAFE (backgrounds)

Neutral Colors:
- Slate 50: #F8FAFC (backgrounds)
- Slate 100: #F1F5F9 (secondary backgrounds)
- Slate 200: #E2E8F0 (borders)
- Slate 300: #CBD5E1 (disabled)
- Slate 600: #475569 (secondary text)
- Slate 700: #334155 (body text)
- Slate 900: #0F172A (headings)

Semantic Colors:
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
- Info: #3B82F6 (blue)

Status Colors:
- Proses: #F59E0B (amber)
- Selesai: #10B981 (green)
- Diambil: #6B7280 (gray)
```

### 2.3 Icons
- **Library**: Phosphor Icons (Web font atau React version)
- **Size**: 20px (default), 24px (large), 16px (small)
- **Weight**: Regular (default), Bold (emphasis)

**Icon Container Style** (Premium Look):
- Icons wrapped in rounded boxes for structured appearance
- Border radius: 8px (medium rounded)
- Padding: 8-10px
- Two style variations:
  
  **Primary Style** (for emphasis):
  - Icon color: White (#FFFFFF)
  - Background: Primary Blue (#3B82F6)
  - Subtle shadow: 0 2px 4px rgba(59, 130, 246, 0.1)
  
  **Secondary Style** (for subtle elements):
  - Icon color: Primary Blue (#3B82F6) or Slate 700
  - Background: Slate 100 (#F1F5F9) or Primary Blue Light (#DBEAFE)
  - Border: 1px solid Slate 200 (optional)
  
  **Usage Examples**:
  - Dashboard quick actions: Primary style
  - Navigation icons: Secondary style
  - Status indicators: Colored icon on light background
  - List item icons: Small secondary style

### 2.4 Spacing System (Compact)
```
xs: 4px   (0.25rem)
sm: 8px   (0.5rem)
md: 12px  (0.75rem)
lg: 16px  (1rem)
xl: 20px  (1.25rem)
2xl: 24px (1.5rem)
3xl: 32px (2rem)
```

### 2.5 Layout Principles
- **Mobile-First**: Design dimulai dari 320px width
- **Compact Spacing**: Gunakan spacing sm-md untuk mayoritas elemen
- **Breathable Forms**: Input fields dengan padding yang cukup untuk touch
- **Consistent Gaps**: Gap antar section maksimal lg (16px)
- **Screen Padding**: Horizontal padding md-lg (12-16px)

### 2.6 Component Style Guidelines
```
Cards:
- Border radius: 8px
- Padding: 12px
- Border: 1px solid Slate 200
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.1))

Buttons:
- Height: 40px (medium), 36px (small)
- Padding: 8px 16px (medium), 6px 12px (small)
- Border radius: 6px
- Font weight: 500

Input Fields:
- Height: 40px
- Padding: 8px 12px
- Border radius: 6px
- Border: 1px solid Slate 300
- Focus: 2px ring Primary Blue

Tables/Lists:
- Row padding: 8px 12px
- Row gap: 2px
- Alternating backgrounds optional
```

---

## 3. Database Schema (Supabase)

### 3.1 Table: `users`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
email: varchar(255) UNIQUE NOT NULL
password_hash: varchar(255) NOT NULL (hashed with bcrypt)
full_name: varchar(255) NOT NULL
is_owner: boolean DEFAULT false
is_active: boolean DEFAULT true
last_login: timestamp
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()

INDEX: email

NOTES:
- Authentication menggunakan Supabase Auth
- is_owner: true untuk owner yang bisa CRUD users
- is_active: untuk soft disable user tanpa hapus
```

### 3.2 Table: `customers`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
name: varchar(255) NOT NULL
phone: varchar(20) NOT NULL
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()

INDEX: phone (untuk search cepat)
```

### 3.3 Table: `transactions`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
transaction_number: varchar(50) UNIQUE NOT NULL
customer_id: uuid REFERENCES customers(id)
customer_name: varchar(255) NOT NULL (denormalized untuk performa)
customer_phone: varchar(20) NOT NULL (denormalized)
created_by: uuid REFERENCES users(id) (user yang buat transaksi)
total_amount: decimal(10,2) NOT NULL
paid_amount: decimal(10,2) NOT NULL DEFAULT 0
status: enum('proses', 'selesai', 'diambil') DEFAULT 'proses'
notes: text
date_in: timestamp NOT NULL
date_out: timestamp NOT NULL (estimasi selesai)
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()

INDEX: transaction_number, status, date_in, customer_phone
```

### 3.4 Table: `transaction_items`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
transaction_id: uuid REFERENCES transactions(id) ON DELETE CASCADE
item_type: enum('kiloan_reguler', 'kiloan_ekspres', 'karpet', 'bedcover') NOT NULL
quantity: decimal(10,2) NOT NULL (untuk kg bisa decimal)
unit: varchar(10) NOT NULL (kg/pcs)
unit_price: decimal(10,2) NOT NULL
subtotal: decimal(10,2) NOT NULL
created_at: timestamp DEFAULT now()

INDEX: transaction_id
```

### 3.5 Table: `price_settings`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
item_type: varchar(50) UNIQUE NOT NULL
item_label: varchar(100) NOT NULL
price: decimal(10,2) NOT NULL
unit: varchar(10) NOT NULL
duration_days: integer (untuk estimasi, null jika tidak applicable)
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()

DEFAULT DATA:
- kiloan_reguler: TBD, kg, 3 hari
- kiloan_ekspres: TBD, kg, 1 hari
- karpet: TBD, pcs, null
- bedcover: TBD, pcs, null
```

### 3.6 Table: `app_settings`
```sql
id: uuid PRIMARY KEY DEFAULT uuid_generate_v4()
key: varchar(100) UNIQUE NOT NULL
value: text NOT NULL
created_at: timestamp DEFAULT now()
updated_at: timestamp DEFAULT now()

DEFAULT DATA:
- laundry_name: "Nama Laundry"
- laundry_address: "Alamat"
- laundry_phone: "Nomor HP"
```

---

## 4. Application Structure

### 4.1 Tech Stack
- **Framework**: React 18+ (functional components)
- **State Management**: React Hooks (useState, useReducer, useContext)
- **Authentication**: Supabase Auth (email/password)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS (utility-first)
- **Icons**: Phosphor Icons
- **Print**: Browser print API
- **PWA**: Service Worker + Web Manifest

### 4.2 Folder Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── ForgotPasswordForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   └── Container.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── IconBox.jsx (untuk icon dengan rounded box)
│   ├── transactions/
│   │   ├── TransactionForm.jsx
│   │   ├── TransactionList.jsx
│   │   ├── TransactionDetail.jsx
│   │   └── ItemSelector.jsx
│   ├── users/
│   │   ├── UserList.jsx
│   │   ├── UserForm.jsx
│   │   └── UserCard.jsx
│   └── print/
│       └── PrintReceipt.jsx
├── pages/
│   ├── Login.jsx
│   ├── ForgotPassword.jsx
│   ├── Dashboard.jsx
│   ├── NewTransaction.jsx
│   ├── TransactionList.jsx
│   ├── Reports.jsx
│   ├── Settings.jsx
│   └── Users.jsx (owner only)
├── services/
│   ├── supabase.js
│   ├── auth.js
│   ├── transactions.js
│   ├── customers.js
│   ├── users.js
│   └── settings.js
├── utils/
│   ├── formatters.js (currency, date)
│   ├── validators.js
│   └── generators.js (transaction number)
├── hooks/
│   ├── useAuth.js
│   ├── useTransactions.js
│   └── useSettings.js
├── contexts/
│   └── AuthContext.jsx
└── App.jsx
```

---

## 5. Page Specifications

### 5.0 Login Page (/login)
**Layout**: Centered card, mobile-optimized

**Components**:

1. **Login Card**
   - Logo/Icon laundry (centered, dengan IconBox style)
   - Heading: "Laundry Cashier" atau nama laundry
   - Subheading: "Masuk ke akun Anda"
   
2. **Login Form**
   - Input: Email (type email, autocomplete)
   - Input: Password (type password, toggle visibility icon)
   - Checkbox: Remember Me (persist login 30 hari)
   - Link: Lupa Password?
   - Button: Masuk (primary, full-width)
   - Loading state saat submit
   
3. **Error Handling**
   - Show error message jika email/password salah
   - Show error jika akun tidak aktif (is_active = false)
   - Rate limiting: max 5 attempts dalam 15 menit

**Validation**:
- Email format valid
- Password minimal 6 karakter (Supabase default)

**Behavior**:
- Setelah login sukses → redirect ke Dashboard
- Remember me: simpan session token (expires 30 hari)
- Tidak remember me: session token (expires 24 jam)

**Auto-logout**:
- Idle timeout: 2 jam (120 menit) tanpa aktivitas
- Warning modal muncul 5 menit sebelum logout
- User bisa extend session dari warning modal

---

### 5.0.1 Forgot Password Page (/forgot-password)
**Layout**: Centered card

**Components**:

1. **Reset Form**
   - Heading: "Reset Password"
   - Text: "Masukkan email Anda, kami akan kirim link reset"
   - Input: Email
   - Button: Kirim Link Reset (primary, full-width)
   - Link: Kembali ke Login

2. **Success State**
   - Show success message setelah email terkirim
   - Info: "Cek email Anda untuk link reset password"
   - Button: Kembali ke Login

**Behavior**:
- Menggunakan Supabase Auth resetPasswordForEmail()
- Email berisi magic link untuk reset password
- Link expired dalam 1 jam

---

### 5.1 Dashboard (/)
**Layout**: Mobile-first, compact cards
**Auth**: Protected route (harus login)

**Components**:
1. **Header**
   - Nama laundry + logo (optional)
   - User info: Nama + avatar/initial dalam IconBox
   - Logout button (icon only)
   - Tanggal hari ini
   - Padding: md (12px)

2. **Quick Stats** (3 cards horizontal scroll di mobile)
   - Total transaksi hari ini
   - Pendapatan hari ini (Rp)
   - Pesanan aktif (status: proses + selesai)
   - Card height: auto, padding: md
   - Gap: sm (8px)

3. **Quick Actions** (2 kolom grid)
   - Transaksi Baru (primary button dengan IconBox)
   - Lihat Transaksi
   - Laporan
   - Pengaturan
   - **Users** (hanya tampil jika user is_owner = true)
   - Button height: 48px, icon + text
   - Gap: sm (8px)

4. **Transaksi Terbaru** (List)
   - 5 transaksi terakhir
   - Compact list item: padding sm-md
   - Show: nomor, nama, status, total
   - Tap untuk detail

**Spacing**: Gap antar section: lg (16px)

---

### 5.2 Transaksi Baru (/new)
**Layout**: Form dengan section yang jelas

**Form Sections**:

1. **Data Pelanggan**
   - Input: Nama Pelanggan
   - Input: Nomor HP (tel input)
   - Auto-suggest pelanggan lama (dropdown muncul saat ketik)
   - Gap antar input: sm (8px)

2. **Item Laundry** (Repeatable)
   - Dropdown: Jenis Item
     - Baju Kiloan (Reguler)
     - Baju Kiloan (Ekspres)
     - Karpet
     - Bedcover
   - Input: Jumlah/Berat (number, step sesuai unit)
   - Display: Unit (kg/pcs), Harga satuan, Subtotal
   - Button: + Tambah Item (outline)
   - Button: × Hapus Item (text, red)
   - Gap: sm (8px)
   - Compact item card dengan border

3. **Ringkasan**
   - List semua item dengan subtotal
   - Total Keseluruhan (bold, large)
   - Estimasi Selesai (auto-calculate dari item tercepat)
   - Textarea: Catatan (optional)
   - Gap: md (12px)

4. **Pembayaran**
   - Display: Total Bayar
   - Input: Uang Dibayar
   - Display: Kembalian (calculated)
   - Checkbox: Lunas / DP
   - Gap: sm (8px)

5. **Actions**
   - Button: Simpan & Print (primary, full-width di mobile)
   - Button: Batal (secondary)
   - Sticky bottom di mobile
   - Gap: sm (8px)

**Validation**:
- Nama & HP required
- Minimal 1 item
- Uang dibayar ≥ 0

**Behavior**:
- Setelah save, auto-open print dialog
- Setelah print, redirect ke detail transaksi

---

### 5.3 Daftar Transaksi (/transactions)
**Layout**: Filter + List/Table

**Components**:

1. **Filter Bar** (Sticky top)
   - Tabs: Semua | Proses | Selesai | Diambil
   - Search: Nomor transaksi / Nama / HP
   - Filter tanggal (optional collapsible)
   - Compact: padding sm, gap sm

2. **Transaction List** (Mobile: Cards, Desktop: Table)
   - **Mobile Card** (compact):
     - Nomor transaksi (bold, small)
     - Nama pelanggan (medium)
     - Tanggal masuk | Estimasi selesai
     - Status badge (compact)
     - Total (bold)
     - Padding: md, gap: xs
   
   - **Desktop Table**:
     - Columns: No. Transaksi, Nama, HP, Tgl Masuk, Tgl Selesai, Status, Total
     - Row height: 48px
     - Hover: subtle background

3. **Actions per Item**:
   - Tap/Click card/row → Detail transaksi
   - Swipe left (mobile) / Hover menu (desktop):
     - Edit
     - Print ulang
     - Ubah status
     - Hapus (dengan konfirmasi)

**Pagination**:
- Load more (infinite scroll) atau
- Simple pagination (< 1 2 3 >)
- Show 20 items per page

---

### 5.4 Detail Transaksi (/transactions/:id)
**Layout**: Readonly form style + actions

**Components**:

1. **Header**
   - Nomor Transaksi (large, bold)
   - Status Badge (large)
   - Button: × Tutup (top-right)

2. **Info Pelanggan**
   - Nama, HP
   - Tanggal masuk, Estimasi selesai
   - Compact layout

3. **Detail Item**
   - List semua item dengan qty, harga, subtotal
   - Total keseluruhan
   - Catatan (jika ada)

4. **Info Pembayaran**
   - Total bayar
   - Dibayar
   - Sisa/Kembalian
   - Status: Lunas/Belum Lunas

5. **Action Buttons** (Sticky bottom)
   - Print Nota
   - Edit Transaksi
   - Ubah Status (dropdown: Proses → Selesai → Diambil)
   - Hapus (destructive, konfirmasi)
   - Layout: 2 kolom di mobile, horizontal di desktop

---

### 5.5 Laporan (/reports)
**Layout**: Date range + Stats + Charts

**Components**:

1. **Date Range Picker**
   - Quick filters: Hari Ini | Minggu Ini | Bulan Ini | Custom
   - Compact selector

2. **Summary Stats** (Cards)
   - Total Transaksi
   - Total Pendapatan
   - Total Berat (kg)
   - Rata-rata per Transaksi
   - 2x2 grid di mobile, 4 kolom di desktop
   - Compact cards

3. **Breakdown by Item Type**
   - Table: Item | Qty | Subtotal
   - Compact table

4. **Transaction History Table**
   - Similar to transaction list
   - Export button (optional)

5. **Charts** (Optional future)
   - Pendapatan per hari (line chart)
   - Item type distribution (pie chart)

---

### 5.6 Pengaturan (/settings)
**Layout**: Tabbed sections
**Auth**: Protected route

**Tabs**:
1. **Info Laundry**
   - Nama, Alamat, HP
   - Save button

2. **Harga**
   - List semua item type
   - Input: Harga per unit
   - Input: Durasi (hari) untuk kiloan
   - Save button per item atau save all

3. **Akun**
   - Nama lengkap (editable)
   - Email (readonly)
   - Button: Ubah Password
   - Button: Logout

**Layout**: Compact form dengan clear sections

---

### 5.7 Users Management (/users)
**Layout**: List + Modal form
**Auth**: Protected route - **OWNER ONLY** (is_owner = true)

**Components**:

1. **Header**
   - Title: "Kelola Pengguna"
   - Button: + Tambah Pengguna (primary)

2. **User List** (Cards di mobile, Table di desktop)
   - **User Card**:
     - Avatar/Initial dalam IconBox
     - Nama lengkap
     - Email
     - Badge: Owner / Kasir
     - Badge: Aktif / Nonaktif
     - Last login time
     - Actions: Edit, Deactivate/Activate, Delete
   
   - **Desktop Table**:
     - Columns: Avatar, Nama, Email, Role, Status, Last Login, Actions
     - Row height: 56px

3. **Add/Edit User Modal**
   - Input: Email
   - Input: Nama Lengkap
   - Input: Password (hanya saat create)
   - Checkbox: Set sebagai Owner
   - Toggle: Akun Aktif
   - Buttons: Simpan, Batal

**Validation**:
- Email format valid & unique
- Password minimal 6 karakter
- Nama required

**Behavior**:
- Owner tidak bisa delete diri sendiri
- Minimal harus ada 1 owner aktif
- Deactivate user: set is_active = false (soft delete)
- Delete user: hard delete (dengan konfirmasi kuat)
- Saat create: kirim email invitation (optional future)

**Security**:
- Non-owner redirect ke dashboard jika akses /users
- Show 403 error jika force access

---

## 6. Authentication Flow

### 7.1 Receipt Design (Nota)
**Size**: 58mm thermal printer (atau A4 untuk test)

**Layout**:
```
================================
      [NAMA LAUNDRY]
    [Alamat Laundry]
      HP: [Nomor HP]
================================
No: NML-20260103-001
Tanggal: 03 Jan 2026, 14:30

Pelanggan: [Nama]
HP: [Nomor HP]

--------------------------------
DETAIL PESANAN:
--------------------------------
[Item Type]
[Qty] [Unit] x Rp [Price]  Rp [Subtotal]

[Repeat untuk semua item]

--------------------------------
TOTAL:           Rp [Total]
Dibayar:         Rp [Paid]
Kembalian:       Rp [Change]

Masuk:  [Date In]
SELESAI: [Date Out]
================================
Terima kasih!
Harap bawa nota saat ambil
================================
```

**Font**: Monospace untuk alignment
**Print**: 2 copies (pelanggan + laundry)

---

## 8. PWA Specifications

### 8.1 Manifest (manifest.json)
```json
{
  "name": "New Mahkota Laundry",
  "short_name": "New Mahkota",
  "description": "Aplikasi kasir untuk New Mahkota Laundry",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#3B82F6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 8.2 Service Worker
- Cache static assets (HTML, CSS, JS, fonts)
- Cache Phosphor icons
- Network-first strategy untuk API calls
- Offline fallback page

### 8.3 Install Prompt
- Detect installable
- Show compact banner di bottom: "Install aplikasi ke HP?"
- Dismiss + Don't show again option

### 8.4 iOS-specific Considerations
- PWA works on iOS 11.3+ via Safari
- Install via Safari → Share → "Add to Home Screen"
- Runs in fullscreen mode (standalone)
- No notification push support (not needed for this app)
- Service worker caching works normally
- Authentication persists via localStorage/sessionStorage

---

## 9. Responsive Breakpoints

```
Mobile (default): 320px - 767px
  - Single column layout
  - Compact spacing (sm-md)
  - Sticky headers/footers
  - Bottom navigation

Tablet: 768px - 1023px
  - 2 column grids where appropriate
  - Increased spacing (md-lg)
  - Side navigation option

Desktop: 1024px+
  - Max width container (1280px)
  - Multi-column layouts
  - Hover states
  - Side navigation
```

---

## 10. Performance Requirements

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)
- **API Response**: < 500ms (average)

**Optimization Strategies**:
- Code splitting per route
- Lazy load Phosphor icons
- Minimize Tailwind CSS (PurgeCSS)
- Debounce search inputs
- Virtual scrolling untuk long lists (optional)

---

## 11. Data Flow

### 11.1 User Authentication
```
Login → Validate credentials → Create session → 
Setup idle timer → Store token → Redirect dashboard
```

### 11.2 Create User (Owner only)
```
Owner fills form → Validate email unique → 
Hash password → Insert users table → 
Send invitation email (optional) → Show success
```

### 11.3 Create Transaction
```
User Input → Validate → Generate Transaction Number → 
Insert customers (if new) → Insert transaction → 
Insert transaction_items → Return transaction ID → 
Open print dialog → Navigate to detail
```

### 11.4 Update Transaction
```
Fetch transaction → User edit → Validate → 
Update transaction → Update/Delete/Insert items → 
Sync totals → Show success
```

### 11.5 Change Status
```
Select transaction → Choose new status → 
Validate transition (proses → selesai → diambil) → 
Update transaction.status → Refresh list
```

---

## 12. Security & Validation

### 12.1 Client-side Validation
- Required fields check
- Email format validation (RFC 5322)
- Phone number format (ID: 08xx or 62xxx)
- Password strength: min 6 characters (Supabase default)
- Positive numbers for quantity/amount
- Logical date ranges (date_out > date_in)

### 12.2 Supabase Auth Security
- Email/password authentication
- Bcrypt password hashing (automatic)
- Session token with expiry
- Refresh token rotation
- CSRF protection (built-in)
- Rate limiting on login attempts

### 12.3 Supabase RLS (Row Level Security)
**Enable RLS on all tables:**

**users table:**
```sql
-- Allow users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Only owners can view all users
CREATE POLICY "Owners can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_owner = true
    )
  );

-- Only owners can insert/update/delete users
CREATE POLICY "Owners can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_owner = true
    )
  );
```

**transactions, transaction_items, customers, price_settings, app_settings:**
```sql
-- All authenticated users can read/write (shared data)
CREATE POLICY "Authenticated users full access" ON [table_name]
  FOR ALL USING (auth.uid() IS NOT NULL);
```

### 12.4 API Key Security
- Store Supabase keys in environment variables
- Use anon key (public) for client-side
- Never expose service_role key

---

## 13. Future Enhancements (Out of Scope v1)

- Social login (Google, Apple) - **NEXT UPDATE**
- User roles with granular permissions - **NEXT UPDATE**
- WhatsApp notification untuk pelanggan
- Multi-laundry support (multi-tenant)
- Inventory management (deterjen, pewangi)
- Customer loyalty program
- Advanced analytics dashboard
- Export laporan ke Excel/PDF
- Dark mode
- Multi-language support

---

## 14. Development Checklist

### Phase 1: Setup
- [ ] Initialize React project with Vite
- [ ] Setup Tailwind CSS
- [ ] Import Plus Jakarta Sans font
- [ ] Import Phosphor Icons
- [ ] Setup Supabase client
- [ ] Create database tables & indexes
- [ ] Setup Supabase Auth
- [ ] Configure RLS policies
- [ ] Create IconBox component
- [ ] Setup PWA (manifest + service worker)

### Phase 2: Authentication
- [ ] Login page UI
- [ ] Login functionality dengan Supabase Auth
- [ ] Remember me feature
- [ ] Forgot password page
- [ ] Password reset flow
- [ ] Protected route wrapper
- [ ] Auth context & hooks
- [ ] Auto-logout on idle (2 hours)
- [ ] Session management

### Phase 3: Core Features
- [ ] Layout & Navigation (dengan user info)
- [ ] Dashboard page (dengan conditional users button)
- [ ] New Transaction form
- [ ] Transaction List & Detail
- [ ] Print receipt functionality
- [ ] Settings page (prices, info, account)
- [ ] Users management page (owner only)

### Phase 4: Polish
- [ ] Responsive design refinement
- [ ] Icon boxes styling across app
- [ ] Loading states & error handling
- [ ] Form validations
- [ ] Print styling
- [ ] PWA testing & install flow
- [ ] iOS Safari testing

### Phase 5: Testing
- [ ] Manual testing all flows
- [ ] Auth flows testing (login, logout, reset)
- [ ] Owner vs non-owner access testing
- [ ] Mobile testing (Android & iOS real device)
- [ ] Print testing (thermal printer)
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Idle timeout testing

---

## 15. Notes
- Semua spacing mengikuti compact principle
- Mobile-first: design dimulai dari 320px
- Avoid over-engineering: simple & effective
- Prioritas: speed, reliability, ease of use
- Design harus terasa premium, bukan template AI