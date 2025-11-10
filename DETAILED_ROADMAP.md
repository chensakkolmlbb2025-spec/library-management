# Detailed Library Management System Development Guide

## Day 1: Foundation & Authentication

### Morning: Project Setup & Core Libraries

#### Essential Libraries
```bash
# Core
next@13
react@18
react-dom@18
typescript@5

# UI & Styling
tailwindcss
@radix-ui/react-*
@shadcn/ui
class-variance-authority
clsx
tailwind-merge

# Backend & Data
@supabase/supabase-js
@supabase/auth-helpers-nextjs
@tanstack/react-query

# Forms & Validation
react-hook-form
@hookform/resolvers
zod

# Utilities
lucide-react
sonner
date-fns
```

#### Key Learning Points
1. **Next.js 13+ App Router**
   - File-based routing
   - Layout system
   - Server/Client components
   - API routes

2. **TypeScript Fundamentals**
   - Type definitions
   - Interfaces vs Types
   - Generics
   - Utility types

3. **Tailwind CSS**
   - Utility classes
   - Custom configuration
   - Component styles
   - Responsive design

### Afternoon: Authentication System

#### Components to Create

1. **AuthContext** (`src/context/AuthContext.tsx`)
```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

2. **Login Page** (`src/pages/Login.tsx`)
- Email/password form
- Role selection
- Error handling
- Redirect logic

3. **Protected Route** (`src/components/ProtectedRoute.tsx`)
```typescript
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}
```

4. **Navigation Guard** (`src/hooks/useAuth.ts`)
```typescript
const useAuth = () => {
  // Authentication state management
  // Role checking
  // Session persistence
};
```

#### Key Learning Points
1. **Supabase Authentication**
   - Email/password auth
   - JWT tokens
   - Session management
   - OAuth providers

2. **Role-Based Access Control**
   - Permission system
   - Role hierarchy
   - Access policies

3. **React Context API**
   - Context creation
   - Provider pattern
   - Consumer hooks
   - Performance optimization

## Day 2: Database & Core Components

### Morning: Database Schema & Relations

#### Tables to Create

1. **Profiles Table**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'STAFF', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_profile_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

2. **Books Table**
```sql
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  description TEXT,
  genre TEXT,
  cover_image_url TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT copies_check CHECK (available_copies <= total_copies)
);
```

3. **Loans Table**
```sql
CREATE TABLE loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  book_id UUID REFERENCES books(id),
  checkout_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE')),
  renewed_count INTEGER DEFAULT 0
);
```

#### Row Level Security (RLS)
```sql
-- Example RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

### Afternoon: Core Components

#### 1. Layout System

**BaseLayout** (`src/components/layout/BaseLayout.tsx`)
```typescript
interface BaseLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}
```

**Components:**
- Navbar
- Sidebar
- Footer
- ErrorBoundary

#### 2. UI Components

1. **BookCard** (`src/components/ui/BookCard.tsx`)
```typescript
interface BookCardProps {
  book: Book;
  onBorrow?: (bookId: string) => Promise<void>;
  onReturn?: (bookId: string) => Promise<void>;
  showActions?: boolean;
}
```

2. **SearchBar** (`src/components/ui/SearchBar.tsx`)
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}
```

3. **DataTable** (`src/components/ui/DataTable.tsx`)
```typescript
interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
}
```

#### 3. Form Components

1. **InputField** (`src/components/forms/InputField.tsx`)
```typescript
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}
```

2. **SelectField** (`src/components/forms/SelectField.tsx`)
```typescript
interface SelectFieldProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}
```

#### Key Learning Points
1. **Component Design Patterns**
   - Compound components
   - Render props
   - Higher-order components
   - Custom hooks

2. **Form Handling**
   - React Hook Form usage
   - Form validation
   - Error handling
   - Controlled vs Uncontrolled

3. **State Management**
   - Local state
   - Context API
   - React Query
   - Optimistic updates

## Day 3: Student Features

### Morning: Book Catalog Implementation

#### Components to Create

1. **BookCatalog** (`src/components/BookCatalog.tsx`)
```typescript
interface BookCatalogProps {
  initialBooks?: Book[];
  onBorrowRequest?: (bookId: string) => Promise<void>;
}
```

2. **BookFilters** (`src/components/BookFilters.tsx`)
```typescript
interface FilterOptions {
  genres: string[];
  availability: boolean;
  sortBy: 'title' | 'author' | 'date';
}
```

3. **BookDetails** (`src/components/BookDetails.tsx`)
```typescript
interface BookDetailsProps {
  book: Book;
  loanHistory?: Loan[];
  availabilityStatus: 'available' | 'borrowed' | 'reserved';
}
```

#### Key Learning Points
1. **Data Fetching**
   - React Query setup
   - Infinite loading
   - Cache management
   - Error boundaries

2. **Search Implementation**
   - Debouncing
   - Filters
   - Sort functions
   - Search algorithms

### Afternoon: Student Dashboard

#### Components to Create

1. **StudentDashboard** (`src/pages/StudentDashboard.tsx`)
```typescript
interface DashboardStats {
  activeLoans: number;
  overdueItems: number;
  totalFines: number;
  requestsPending: number;
}
```

2. **LoanCard** (`src/components/LoanCard.tsx`)
```typescript
interface LoanCardProps {
  loan: Loan;
  onRenew?: () => Promise<void>;
  daysUntilDue: number;
}
```

3. **FinesOverview** (`src/components/FinesOverview.tsx`)
```typescript
interface Fine {
  id: string;
  amount: number;
  reason: string;
  date: Date;
  paid: boolean;
}
```

#### API Endpoints to Create

1. Book Search
```typescript
// /api/books/search
interface SearchParams {
  query: string;
  filters: FilterOptions;
  page: number;
  limit: number;
}
```

2. Borrow Request
```typescript
// /api/books/borrow
interface BorrowRequestBody {
  bookId: string;
  userId: string;
  requestDate: Date;
}
```

## Day 4: Staff Features

### Morning: Staff Dashboard

#### Components to Create

1. **RequestProcessor** (`src/components/staff/RequestProcessor.tsx`)
```typescript
interface RequestProcessorProps {
  request: BorrowRequest;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}
```

2. **LoanManager** (`src/components/staff/LoanManager.tsx`)
```typescript
interface LoanManagerProps {
  loans: Loan[];
  onReturn: (loanId: string) => Promise<void>;
  onExtend: (loanId: string, days: number) => Promise<void>;
}
```

3. **UserLookup** (`src/components/staff/UserLookup.tsx`)
```typescript
interface UserLookupProps {
  onUserSelect: (user: Profile) => void;
  excludeRoles?: UserRole[];
}
```

### Afternoon: Inventory Management

#### Components to Create

1. **BookForm** (`src/components/staff/BookForm.tsx`)
```typescript
interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: BookFormData) => Promise<void>;
}

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  description?: string;
  genre?: string;
  totalCopies: number;
  coverImage?: File;
}
```

2. **InventoryList** (`src/components/staff/InventoryList.tsx`)
```typescript
interface InventoryListProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => Promise<void>;
}
```

#### Key Learning Points
1. **File Handling**
   - Image uploads
   - File validation
   - Storage management
   - Image optimization

2. **Complex Forms**
   - Multi-step forms
   - Form arrays
   - Dynamic fields
   - Validation rules

## Day 5: Admin Features

### Morning: User Management

#### Components to Create

1. **UserManager** (`src/components/admin/UserManager.tsx`)
```typescript
interface UserManagerProps {
  users: Profile[];
  onRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
  onStatusChange: (userId: string, active: boolean) => Promise<void>;
}
```

2. **ActivityLog** (`src/components/admin/ActivityLog.tsx`)
```typescript
interface Activity {
  id: string;
  userId: string;
  action: 'LOGIN' | 'BORROW' | 'RETURN' | 'ADMIN_ACTION';
  details: string;
  timestamp: Date;
}
```

### Afternoon: System Configuration

#### Components to Create

1. **Settings** (`src/components/admin/Settings.tsx`)
```typescript
interface SystemSettings {
  loanDuration: number;
  maxBooksPerUser: number;
  fineRate: number;
  allowRenewals: boolean;
  maxRenewals: number;
}
```

2. **Analytics** (`src/components/admin/Analytics.tsx`)
```typescript
interface AnalyticsData {
  totalUsers: number;
  activeLoans: number;
  popularBooks: Array<{ book: Book; borrowCount: number }>;
  fineCollected: number;
}
```

## Day 6: Advanced Features

### Morning: Notifications System

#### Components to Create

1. **NotificationCenter** (`src/components/notifications/NotificationCenter.tsx`)
```typescript
interface Notification {
  id: string;
  type: 'DUE_SOON' | 'OVERDUE' | 'AVAILABLE' | 'SYSTEM';
  message: string;
  timestamp: Date;
  read: boolean;
}
```

2. **EmailTemplates** (`src/lib/email-templates.tsx`)
```typescript
interface EmailTemplate {
  subject: string;
  body: string;
  variables: Record<string, string>;
}
```

### Afternoon: Optimizations

#### Performance Improvements
1. **Virtualization** for long lists
2. **Lazy loading** for images
3. **Debouncing** for search
4. **Caching** for frequent queries

#### Code Splitting
```typescript
// Example dynamic import
const BookDetails = dynamic(() => import('@/components/BookDetails'), {
  loading: () => <BookDetailsSkeleton />
});
```

## Day 7: Testing & Deployment

### Morning: Testing Setup

#### Test Types to Implement

1. **Unit Tests**
```typescript
// Example test for BookCard
describe('BookCard', () => {
  it('should show borrow button when book is available', () => {
    // Test implementation
  });
});
```

2. **Integration Tests**
```typescript
// Example test for borrow flow
describe('Borrow Flow', () => {
  it('should create a borrow request when student requests a book', () => {
    // Test implementation
  });
});
```

3. **E2E Tests**
```typescript
// Example Cypress test
describe('Login Flow', () => {
  it('should login successfully with valid credentials', () => {
    // Test implementation
  });
});
```

### Afternoon: Deployment

#### Deployment Checklist
1. Environment Variables
2. Build Optimization
3. Error Monitoring
4. Analytics Setup
5. Backup Strategy

## Learning Resources

### React & Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Overview](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### UI & Styling
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Backend & Database
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

## Daily Progress Tracking

Create a `.progress` file in your project root:
```json
{
  "day": 1,
  "completed": {
    "setup": true,
    "auth": false
  },
  "currentTask": "Implementing login form",
  "blockers": [],
  "notes": []
}
```

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparations

### Commit Convention
```bash
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Example: feat(auth): add login form with email validation
```

This detailed roadmap should give you a clear path to rebuilding the library system with modern best practices and maintainable code structure.