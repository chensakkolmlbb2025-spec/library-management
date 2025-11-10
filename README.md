# University Library System Management

A modern, beautiful library management system built with React.js featuring iOS-inspired glassmorphism design and role-based access control.

## Features

### Student Portal
- Browse and search library catalog
- Place borrow requests and reservations
- View current loans and due dates
- Track fines and overdue items
- Renew books

### Staff Dashboard
- Approve/reject borrow requests
- Manage inventory (add, update books)
- Check-out and check-in books
- Manage holds and queues

### Admin Panel
- Create and manage user accounts
- Assign roles and permissions
- View reports and analytics
- Configure system settings (loan periods, fine rates)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with custom glassmorphism design system
- **React Router** for navigation
- **Context API** for state management
- **Shadcn UI** components
- **Lucide React** icons
- **Local JSON Database** with localStorage persistence

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd university-library-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Demo Accounts

Use these credentials to test different roles:

- **Student**: student@uni.edu / student123
- **Staff**: staff@uni.edu / staff123
- **Admin**: admin@uni.edu / admin123

## Data Storage

This application uses a **local JSON database** stored in `localStorage`. All data persists in your browser.

- Initial data is loaded from `src/lib/db.json`
- All changes are saved to `localStorage` with key `glasslib_database`
- To reset to initial state, clear your browser's localStorage

## Design System

The application uses a beautiful iOS-inspired glassmorphism design with:

- **Primary Color**: iOS Blue (#007AFF)
- **Background**: Cold White (#F9FAFB)
- **Glass Effects**: Translucent backgrounds with blur
- **Responsive**: Mobile-first design
- **Accessible**: WCAG compliant contrast ratios

## Project Structure

```
src/
├── components/
│   ├── ui/           # Shadcn UI components
│   ├── Layout.tsx    # Main layout wrapper
│   └── ProtectedRoute.tsx
├── context/
│   └── AuthContext.tsx
├── lib/
│   ├── database.ts   # Local JSON database service
│   ├── db.json       # Initial database data
│   └── utils.ts      # Utility functions
├── pages/
│   ├── Login.tsx
│   ├── Home.tsx
│   ├── StudentDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Unauthorized.tsx
└── App.tsx
```

## Building for Production

```bash
npm run build
```

The optimized files will be in the `dist` directory.

## License

MIT License - feel free to use this project for educational purposes.
