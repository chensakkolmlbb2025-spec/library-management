import initialData from './db.json';

// Types
export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface Profile {
  id: string;
  email: string;
  password: string;
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
  cover_image_url?: string;
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
  notes: string | null;
  created_at: string;
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
  checked_out_by: string | null;
  created_at: string;
}

export interface Fine {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  paid: boolean;
  created_at: string;
  paid_at: string | null;
  reason?: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Database {
  profiles: Profile[];
  books: Book[];
  borrow_requests: BorrowRequest[];
  loans: Loan[];
  fines: Fine[];
  system_settings: SystemSetting[];
}

// Storage key
const STORAGE_KEY = 'glasslib_database';

// Database class
class LocalDatabase {
  private data: Database;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): Database {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored data, using initial data');
      }
    }
    return initialData as Database;
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: Profile | null; error: Error | null }> {
    const user = this.data.profiles.find(
      (p) => p.email === email && p.password === password
    );
    
    if (!user) {
      return { user: null, error: new Error('Invalid credentials') };
    }

    return { user, error: null };
  }

  async signup(email: string, password: string, fullName: string, role: UserRole): Promise<{ user: Profile | null; error: Error | null }> {
    const exists = this.data.profiles.find((p) => p.email === email);
    if (exists) {
      return { user: null, error: new Error('Email already exists') };
    }

    const newUser: Profile = {
      id: this.generateId(),
      email,
      password,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.profiles.push(newUser);
    this.saveToStorage();

    return { user: newUser, error: null };
  }

  // Books
  async getBooks(filters?: { search?: string }): Promise<Book[]> {
    let books = [...this.data.books];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          b.isbn.toLowerCase().includes(search)
      );
    }

    return books;
  }

  async getBookById(id: string): Promise<Book | null> {
    return this.data.books.find((b) => b.id === id) || null;
  }

  async addBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const newBook: Book = {
      ...book,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.books.push(newBook);
    this.saveToStorage();

    return newBook;
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const index = this.data.books.findIndex((b) => b.id === id);
    if (index === -1) return null;

    this.data.books[index] = {
      ...this.data.books[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage();
    return this.data.books[index];
  }

  async deleteBook(id: string): Promise<boolean> {
    const index = this.data.books.findIndex((b) => b.id === id);
    if (index === -1) return false;

    this.data.books.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Borrow Requests
  async getBorrowRequests(filters?: { userId?: string; status?: string }): Promise<BorrowRequest[]> {
    let requests = [...this.data.borrow_requests];

    if (filters?.userId) {
      requests = requests.filter((r) => r.user_id === filters.userId);
    }

    if (filters?.status) {
      requests = requests.filter((r) => r.status === filters.status);
    }

    return requests;
  }

  async createBorrowRequest(userId: string, bookId: string): Promise<BorrowRequest> {
    const newRequest: BorrowRequest = {
      id: this.generateId(),
      user_id: userId,
      book_id: bookId,
      status: 'PENDING',
      request_date: new Date().toISOString(),
      processed_date: null,
      processed_by: null,
      notes: null,
      created_at: new Date().toISOString(),
    };

    this.data.borrow_requests.push(newRequest);
    this.saveToStorage();

    return newRequest;
  }

  async updateBorrowRequest(id: string, updates: Partial<BorrowRequest>): Promise<BorrowRequest | null> {
    const index = this.data.borrow_requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.data.borrow_requests[index] = {
      ...this.data.borrow_requests[index],
      ...updates,
    };

    this.saveToStorage();
    return this.data.borrow_requests[index];
  }

  // Loans
  async getLoans(filters?: { userId?: string; status?: string[] }): Promise<Loan[]> {
    let loans = [...this.data.loans];

    if (filters?.userId) {
      loans = loans.filter((l) => l.user_id === filters.userId);
    }

    if (filters?.status) {
      loans = loans.filter((l) => filters.status!.includes(l.status));
    }

    return loans;
  }

  async createLoan(userId: string, bookId: string, checkedOutBy: string): Promise<Loan> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    const newLoan: Loan = {
      id: this.generateId(),
      user_id: userId,
      book_id: bookId,
      checkout_date: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      return_date: null,
      status: 'ACTIVE',
      renewed_count: 0,
      checked_out_by: checkedOutBy,
      created_at: new Date().toISOString(),
    };

    this.data.loans.push(newLoan);
    this.saveToStorage();

    return newLoan;
  }

  async updateLoan(id: string, updates: Partial<Loan>): Promise<Loan | null> {
    const index = this.data.loans.findIndex((l) => l.id === id);
    if (index === -1) return null;

    this.data.loans[index] = {
      ...this.data.loans[index],
      ...updates,
    };

    this.saveToStorage();
    return this.data.loans[index];
  }

  // Fines
  async getFines(filters?: { userId?: string; paid?: boolean }): Promise<Fine[]> {
    let fines = [...this.data.fines];

    if (filters?.userId) {
      fines = fines.filter((f) => f.user_id === filters.userId);
    }

    if (filters?.paid !== undefined) {
      fines = fines.filter((f) => f.paid === filters.paid);
    }

    return fines;
  }

  async createFine(userId: string, loanId: string, amount: number, reason: string): Promise<Fine> {
    const newFine: Fine = {
      id: this.generateId(),
      user_id: userId,
      loan_id: loanId,
      amount,
      paid: false,
      created_at: new Date().toISOString(),
      paid_at: null,
      reason,
    };

    this.data.fines.push(newFine);
    this.saveToStorage();

    return newFine;
  }

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    return this.data.profiles.map(({ password, ...profile }) => profile as Profile);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const profile = this.data.profiles.find((p) => p.id === id);
    if (!profile) return null;
    
    const { password, ...profileWithoutPassword } = profile;
    return profileWithoutPassword as Profile;
  }

  async createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const newProfile: Profile = {
      ...profile,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.profiles.push(newProfile);
    this.saveToStorage();

    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile | null> {
    const index = this.data.profiles.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.data.profiles[index] = {
      ...this.data.profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveToStorage();
    
    const { password, ...profileWithoutPassword } = this.data.profiles[index];
    return profileWithoutPassword as Profile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const index = this.data.profiles.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.data.profiles.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // System Settings
  async getSettings(): Promise<SystemSetting[]> {
    return [...this.data.system_settings];
  }

  async getSetting(key: string): Promise<SystemSetting | null> {
    return this.data.system_settings.find((s) => s.setting_key === key) || null;
  }

  async updateSetting(key: string, value: string, updatedBy: string): Promise<SystemSetting | null> {
    const index = this.data.system_settings.findIndex((s) => s.setting_key === key);
    
    if (index === -1) {
      // Create if doesn't exist
      const newSetting: SystemSetting = {
        id: this.generateId(),
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      };
      this.data.system_settings.push(newSetting);
      this.saveToStorage();
      return newSetting;
    }

    this.data.system_settings[index] = {
      ...this.data.system_settings[index],
      setting_value: value,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    };

    this.saveToStorage();
    return this.data.system_settings[index];
  }

  // Helper method to get joined data
  async getBorrowRequestsWithDetails(): Promise<any[]> {
    const requests = await this.getBorrowRequests();
    return requests.map((request) => {
      const book = this.data.books.find((b) => b.id === request.book_id);
      const user = this.data.profiles.find((p) => p.id === request.user_id);
      const processedBy = request.processed_by
        ? this.data.profiles.find((p) => p.id === request.processed_by)
        : null;

      return {
        ...request,
        books: book,
        profiles: user ? { id: user.id, full_name: user.full_name, email: user.email } : null,
        processed_by_profile: processedBy
          ? { id: processedBy.id, full_name: processedBy.full_name, email: processedBy.email }
          : null,
      };
    });
  }

  async getLoansWithDetails(): Promise<any[]> {
    const loans = await this.getLoans();
    return loans.map((loan) => {
      const book = this.data.books.find((b) => b.id === loan.book_id);
      const user = this.data.profiles.find((p) => p.id === loan.user_id);

      return {
        ...loan,
        books: book,
        profiles: user ? { id: user.id, full_name: user.full_name, email: user.email } : null,
      };
    });
  }

  // Advanced operations
  async approveBorrowRequest(requestId: string, staffId: string): Promise<{ success: boolean; loan?: Loan; error?: string }> {
    const request = this.data.borrow_requests.find((r) => r.id === requestId);
    if (!request) return { success: false, error: 'Request not found' };

    const book = this.data.books.find((b) => b.id === request.book_id);
    if (!book) return { success: false, error: 'Book not found' };

    if (book.available_copies <= 0) {
      return { success: false, error: 'No copies available' };
    }

    // Get loan period from settings
    const loanPeriodSetting = this.data.system_settings.find((s) => s.setting_key === 'loan_period_days');
    const loanPeriod = loanPeriodSetting ? parseInt(loanPeriodSetting.setting_value) : 14;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanPeriod);

    // Create loan
    const loan = await this.createLoan(request.user_id, request.book_id, staffId);

    // Update book availability
    await this.updateBook(book.id, {
      available_copies: book.available_copies - 1,
    });

    // Update request status
    await this.updateBorrowRequest(requestId, {
      status: 'APPROVED',
      processed_date: new Date().toISOString(),
      processed_by: staffId,
    });

    return { success: true, loan };
  }

  async rejectBorrowRequest(requestId: string, staffId: string, reason: string): Promise<boolean> {
    const request = this.data.borrow_requests.find((r) => r.id === requestId);
    if (!request) return false;

    await this.updateBorrowRequest(requestId, {
      status: 'REJECTED',
      processed_date: new Date().toISOString(),
      processed_by: staffId,
      notes: reason,
    });

    return true;
  }

  async returnBook(loanId: string): Promise<{ success: boolean; fine?: Fine; error?: string }> {
    const loan = this.data.loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, error: 'Loan not found' };

    const book = this.data.books.find((b) => b.id === loan.book_id);
    if (!book) return { success: false, error: 'Book not found' };

    const returnDate = new Date();
    const dueDate = new Date(loan.due_date);
    
    // Calculate fine if overdue
    let fine: Fine | undefined;
    if (returnDate > dueDate) {
      const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const fineRateSetting = this.data.system_settings.find((s) => s.setting_key === 'fine_rate_per_day');
      const fineRate = fineRateSetting ? parseFloat(fineRateSetting.setting_value) : 0.50;
      
      const fineAmount = daysOverdue * fineRate;
      
      fine = await this.createFine(
        loan.user_id,
        loanId,
        fineAmount,
        `Late return: ${daysOverdue} day(s) overdue`
      );
    }

    // Update loan
    await this.updateLoan(loanId, {
      return_date: returnDate.toISOString(),
      status: 'RETURNED',
    });

    // Update book availability
    await this.updateBook(book.id, {
      available_copies: book.available_copies + 1,
    });

    return { success: true, fine };
  }

  // Reset database to initial state
  resetDatabase(): void {
    this.data = initialData as Database;
    this.saveToStorage();
  }
}

// Export singleton instance
export const db = new LocalDatabase();
