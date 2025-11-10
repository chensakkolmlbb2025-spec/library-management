#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Library Management System...${NC}"

# Create project with Next.js
echo -e "${GREEN}Creating Next.js project...${NC}"
npx create-next-app@latest . --typescript --tailwind --eslint

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @radix-ui/react-icons lucide-react
npm install @hookform/resolvers react-hook-form zod
npm install @tanstack/react-query
npm install clsx tailwind-merge class-variance-authority
npm install sonner # Toast notifications

# Install shadcn/ui components
echo -e "${GREEN}Setting up shadcn/ui...${NC}"
npx shadcn-ui@latest init

# Add commonly used components
echo -e "${GREEN}Adding UI components...${NC}"
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar

# Create directory structure
echo -e "${GREEN}Creating project structure...${NC}"
mkdir -p src/{components/{ui,layout,forms},context,hooks,lib,types}

# Create initial TypeScript types
echo -e "${GREEN}Creating TypeScript types...${NC}"
cat > src/types/index.ts << EOL
export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  genre: string | null;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export interface BorrowRequest {
  id: string;
  user_id: string;
  book_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  request_date: string;
  processed_date: string | null;
  processed_by: string | null;
}

export interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  renewed_count: number;
}
EOL

# Create Supabase client configuration
echo -e "${GREEN}Creating Supabase client...${NC}"
cat > src/lib/supabase.ts << EOL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
EOL

# Create .env.example
echo -e "${GREEN}Creating environment variables template...${NC}"
cat > .env.example << EOL
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOL

# Add README
echo -e "${GREEN}Creating README...${NC}"
cat > README.md << EOL
# Library Management System

A modern library management system built with Next.js, Supabase, and Tailwind CSS.

## Getting Started

1. Copy \`.env.example\` to \`.env.local\` and fill in your Supabase credentials
2. Install dependencies: \`npm install\`
3. Run development server: \`npm run dev\`
4. Open [http://localhost:3000](http://localhost:3000)

## Features

- Role-based authentication (Student/Staff/Admin)
- Book catalog with search and filters
- Borrow request system
- Loan management
- Fine calculation
- User management
- System configuration

## Tech Stack

- Next.js 13+ with TypeScript
- Supabase for backend
- Tailwind CSS for styling
- shadcn/ui components
- React Query for data fetching
EOL

echo -e "${BLUE}Setup complete! Next steps:${NC}"
echo "1. Copy .env.example to .env.local and add your Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Check ROADMAP.md for development guidelines"