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
- **Axios** for API communication
- **React Router** for navigation
- **Context API** for state management
- **Shadcn UI** components
- **Lucide React** icons

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

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Demo Accounts

Use these credentials to test different roles:

- **Student**: student@uni.edu / student123
- **Staff**: staff@uni.edu / staff123
- **Admin**: admin@uni.edu / admin123

## Backend API

This frontend expects a REST API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with email and password

### Books
- `GET /api/books?search={query}` - Search books
- `POST /api/books` - Add new book (Staff/Admin)
- `PATCH /api/books/:id` - Update book (Staff/Admin)

### Borrow Requests
- `GET /api/requests` - Get all requests (Staff)
- `POST /api/borrow-requests` - Create borrow request (Student)
- `PATCH /api/requests/:id/approve` - Approve request (Staff)
- `PATCH /api/requests/:id/reject` - Reject request (Staff)

### User Management
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `PATCH /api/users/:id` - Update user (Admin)

### Loans & Fines
- `GET /api/user/loans` - Get user's loans
- `GET /api/user/fines` - Get user's fines
- `PATCH /api/loans/:id/renew` - Renew loan

### Settings
- `GET /api/settings` - Get system settings (Admin)
- `PATCH /api/settings` - Update settings (Admin)

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
├── pages/
│   ├── Login.tsx
│   ├── StudentDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Unauthorized.tsx
├── services/
│   └── api.ts        # Axios configuration
└── App.tsx
```

## Building for Production

```bash
npm run build
```

The optimized files will be in the `dist` directory.

## License

MIT License - feel free to use this project for educational purposes.
