# DevFlow Dashboard

**Modern Project Management Dashboard for Developers, Freelancers, and Open-Source Maintainers**

[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## Quick Start

> [!IMPORTANT]
> **Prerequisites**: Ensure you have Node.js 18+ and npm installed on your system.

### **1. Clone the Repository**
```bash
git clone https://github.com/nayandas69/devflow-dashboard.git
cd devflow-dashboard
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
cp .env.example .env.local
```

### **4. Configure Environment Variables**
```bash
# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **5. Run Development Server**
```bash
npm run dev
```

### **6. Open Application**
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### **Supabase Setup**

#### **1. Create Supabase Project**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready

#### **2. Get API Keys**
1. Go to Project Settings → API
2. Copy `Project URL` and `anon public` key
3. Add them to your `.env.local` file

#### **3. Configure Authentication**
1. Go to Authentication → Settings
2. Configure email templates (optional)
3. Set up OAuth providers (optional)

## Database Setup

### Setup (needed)

#### **1. Execute SQL Schema**
```sql
-- Copy the contents of database/database.sql
-- Paste in Supabase SQL Editor
-- Execute the queries
```

#### **2. Set Up Row Level Security**
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

### **Database Schema Overview**

#### **Tables Structure**
- **`profiles`** - User profile information and preferences
- **`clients`** - Client management data
- **`projects`** - Project tracking data
- **`project_clients`** - Project-client relationships
- **`tasks`** - Project task management
- **`project_timeline`** - Project milestone tracking

#### **Relationships**
- `projects.client_id` → `clients.id`
- `projects.user_id` → `profiles.id`
- `clients.user_id` → `profiles.id`
- `tasks.project_id` → `projects.id`
- `project_timeline.project_id` → `projects.id`

## Deployment

### **Deploy to Vercel (Recommended)**

> [!IMPORTANT]
> **Vercel provides the best experience for Next.js applications with zero configuration.**

#### **1. Connect Repository**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

#### **2. Environment Variables**
1. Add all environment variables from `.env.local`
2. Make sure to use production Supabase URLs
3. Deploy the project

#### **3. Custom Domain (Optional)**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS settings

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Author

**Nayan Das**
- 🐙 **GitHub**: [@nayandas69](https://github.com/nayandas69)
- 📧 **Email**: nayanchandradas@hotmail.com

---

## Acknowledgments

### **Open Source Libraries**

This project is built upon excellent open source libraries and frameworks:

- **Next.js Team** - React framework with exceptional developer experience
- **Supabase Team** - Open source Firebase alternative with PostgreSQL
- **shadcn** - Beautiful and accessible UI component library
- **Vercel Team** - Optimal deployment platform for Next.js applications
- **Tailwind CSS Team** - Utility-first CSS framework for rapid development

### **Inspiration and Resources**

- **Modern Web Development Practices** - Following current best practices and standards
- **User Experience Research** - Incorporating UX principles for better usability
- **Accessibility Guidelines** - Following WCAG guidelines for inclusive design
- **Security Best Practices** - Implementing security measures and data protection

---

> **Made with ❤️ by [Nayan Das](https://github.com/nayandas69)**

> **⚡ Powered by Next.js, Supabase, and Tailwind CSS**