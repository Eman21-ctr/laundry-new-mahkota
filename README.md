# Laundry New Mahkota - Cashier App

Modern, mobile-first PWA cashier application for Laundry New Mahkota built with React, Tailwind CSS, and Supabase.

## Features

- 🔐 **Secure Authentication** - Supabase Auth with idle timeout
- 📱 **Mobile-First Design** - Optimized for mobile with compact spacing
- 💼 **Transaction Management** - Create, edit, and track laundry orders
- 📊 **Reports & Analytics** - Sales reports with date filtering
- 👥 **User Management** - Owner-only user CRUD operations
- 🧾 **Print Receipts** - Thermal 58mm printer support
- 📴 **PWA Support** - Install on mobile, works offline
- 🎨 **Premium Design** - Using Plus Jakarta Sans font and Phosphor icons

## Tech Stack

- **Frontend:** React 18, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Build Tool:** Vite
- **Icons:** Phosphor React
- **Routing:** React Router v6
- **PWA:** vite-plugin-pwa

## Prerequisites

- Node.js 18+ and npm
- Supabase account (database already set up)

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

\`\`\`
VITE_SUPABASE_URL=https://jfmnfkpctaaohjfgihjf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 3. Database Setup

The database schema is already set up in Supabase. See `docs/database.sql` for reference.

**Owner account credentials:**
- Email: `journalwarga@gmail.com`
- Password: `newmahkota`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5173`

### 5. Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Header, Navigation, Container
│   ├── ui/             # Reusable UI components
│   ├── transactions/   # Transaction-related components
│   ├── users/          # User management components
│   └── print/          # Print receipt component
├── pages/              # Page components
├── services/           # Supabase services (auth, transactions, etc.)
├── utils/              # Utilities (formatters, validators, generators)
├── hooks/              # Custom React hooks
├── contexts/           # React contexts (AuthContext)
└── App.jsx             # Main app with routing
\`\`\`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The PWA will be automatically configured and ready to install on mobile devices.

## Documentation

- **Specification:** `docs/spec.md`
- **Database Schema:** `docs/database.sql`

## License

Private project for Laundry New Mahkota
