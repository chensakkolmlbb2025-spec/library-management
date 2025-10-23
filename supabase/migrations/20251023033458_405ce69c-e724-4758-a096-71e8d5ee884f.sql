-- Create user profiles table with roles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'STAFF', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  description TEXT,
  genre TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
  available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Books RLS policies
CREATE POLICY "Anyone can view books"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Staff and admin can insert books"
  ON public.books FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

CREATE POLICY "Staff and admin can update books"
  ON public.books FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

-- Create borrow requests table
CREATE TABLE public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  request_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_date TIMESTAMPTZ,
  processed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on borrow requests
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- Borrow requests RLS policies
CREATE POLICY "Users can view own requests"
  ON public.borrow_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all requests"
  ON public.borrow_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

CREATE POLICY "Students can create requests"
  ON public.borrow_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update requests"
  ON public.borrow_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  checkout_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETURNED', 'OVERDUE')),
  renewed_count INTEGER NOT NULL DEFAULT 0,
  checked_out_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Loans RLS policies
CREATE POLICY "Users can view own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all loans"
  ON public.loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

CREATE POLICY "Staff can create loans"
  ON public.loans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

CREATE POLICY "Staff can update loans"
  ON public.loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

-- Create fines table
CREATE TABLE public.fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- Enable RLS on fines
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;

-- Fines RLS policies
CREATE POLICY "Users can view own fines"
  ON public.fines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all fines"
  ON public.fines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

CREATE POLICY "Staff can manage fines"
  ON public.fines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
    )
  );

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on system settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- System settings RLS policies
CREATE POLICY "Anyone can view settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
  ('loan_period_days', '14'),
  ('fine_rate_per_day', '0.50'),
  ('max_renewals', '2'),
  ('max_active_loans', '5');

-- Insert sample books
INSERT INTO public.books (title, author, isbn, description, genre, total_copies, available_copies) VALUES
  ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'A classic American novel set in the Jazz Age', 'Fiction', 5, 5),
  ('To Kill a Mockingbird', 'Harper Lee', '978-0061120084', 'A gripping tale of racial injustice and childhood innocence', 'Fiction', 4, 4),
  ('1984', 'George Orwell', '978-0451524935', 'A dystopian social science fiction novel', 'Science Fiction', 6, 6),
  ('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'A romantic novel of manners', 'Romance', 3, 3),
  ('The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'A story about teenage rebellion', 'Fiction', 4, 4),
  ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0439708180', 'The first book in the Harry Potter series', 'Fantasy', 8, 8),
  ('The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 'A fantasy adventure novel', 'Fantasy', 5, 5),
  ('Fahrenheit 451', 'Ray Bradbury', '978-1451673319', 'A dystopian novel about censorship', 'Science Fiction', 3, 3),
  ('The Lord of the Rings', 'J.R.R. Tolkien', '978-0544003415', 'Epic high-fantasy trilogy', 'Fantasy', 4, 4),
  ('Brave New World', 'Aldous Huxley', '978-0060850524', 'A dystopian novel exploring technological control', 'Science Fiction', 3, 3);