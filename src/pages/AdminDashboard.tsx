import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Package,
  UserCheck,
  Edit,
  Trash,
  BookPlus,
  BookCheck,
  Clock,
  BookOpen,
} from "lucide-react";
import { db } from "@/lib/database";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import type { UserRole, Profile as AuthProfile } from "@/context/AuthContext";
import { UserDialog } from "@/components/UserDialog";
import { BookDialog } from "@/components/BookDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Profile = AuthProfile & {
  created_at: string;
};

interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
}

interface DBBook {
  id: string;
  title: string;
  author: string;
  available_copies: number;
  total_copies: number;
  cover_image_url?: string;
}

interface Book extends DBBook {
  isbn: string;
  description: string | null;
  genre: string | null;
}

interface DBProfile {
  id: string;
  full_name: string;
  email: string;
}

interface BorrowRequest {
  id: string;
  user_id: string;
  request_date: string;
  processed_date: string | null;
  processed_by: string | null;
  status: string;
  profiles: DBProfile | null;
  books: DBBook | null;
}

interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  due_date: string;
  return_date: string | null;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  profiles: DBProfile | null;
  books: DBBook | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  // Dialog states
  const [userDialog, setUserDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    user?: any;
  }>({
    open: false,
    mode: 'create',
  });
  const [bookDialog, setBookDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    book?: any;
  }>({
    open: false,
    mode: 'create',
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'book';
    id: string;
    name: string;
  }>({
    open: false,
    type: 'user',
    id: '',
    name: '',
  });

  const fetchActiveLoans = useCallback(async () => {
    try {
      const data = await db.getLoansWithDetails();
      const activeData = data.filter((loan: any) => 
        ['ACTIVE', 'OVERDUE'].includes(loan.status)
      ).sort((a: any, b: any) => {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return dateA - dateB;
      });

      const transformedLoans = (activeData || []).map((loan: any) => ({
        ...loan,
        status: loan.status as "ACTIVE" | "RETURNED" | "OVERDUE",
      }));

      setActiveLoans(transformedLoans as Loan[]);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch active loans:", err);
      toast.error("Failed to fetch active loans");
    }
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await db.getProfiles();
      setProfiles(
        (data || []).map((profile: any) => ({
          ...profile,
          role: profile.role as UserRole,
        }))
      );
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch profiles:", err.message);
      toast.error("Failed to fetch profiles");
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await db.getSettings();
      const settingsMap: Record<string, string> = {};
      data?.forEach((setting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await db.getBooks();
      setBooks((data as Book[]) || []);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch books:", err);
      toast.error("Failed to fetch books");
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    fetchSettings();
    fetchActiveLoans();
    fetchBooks();
  }, [fetchActiveLoans, fetchProfiles, fetchSettings, fetchBooks]);

  const handleUserSubmit = async (userData: any) => {
    setIsLoading(true);
    try {
      if (userDialog.mode === 'create') {
        const { user: createdUser, error } = await db.signup(
          userData.email,
          userData.password,
          userData.full_name,
          userData.role
        );

        if (error) throw error;
        toast.success("User created successfully!");
      } else if (userDialog.mode === 'edit' && userData.id) {
        await db.updateProfile(userData.id, {
          full_name: userData.full_name,
          role: userData.role,
          ...(userData.password && { password: userData.password }),
        });
        toast.success("User updated successfully!");
      }
      
      fetchProfiles();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || `Failed to ${userDialog.mode} user`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await db.deleteProfile(deleteDialog.id);
      toast.success("User deleted successfully!");
      fetchProfiles();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleBookSubmit = async (bookData: any) => {
    try {
      if (bookDialog.mode === 'create') {
        await db.addBook(bookData);
        toast.success("Book added successfully!");
      } else if (bookDialog.mode === 'edit' && bookDialog.book?.id) {
        await db.updateBook(bookDialog.book.id, bookData);
        toast.success("Book updated successfully!");
      }
      
      fetchBooks();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || `Failed to ${bookDialog.mode} book`);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await db.deleteBook(deleteDialog.id);
      toast.success("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to delete book");
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await db.updateSetting(key, value, user?.id || '');
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast.success("Setting updated successfully!");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to update setting");
    }
  };

  const handleBookReturn = async (loan: Loan) => {
    try {
      if (!loan.books) {
        toast.error("Book information not found");
        return;
      }

      const now = new Date();
      const dueDate = new Date(loan.due_date);
      const isOverdue = dueDate < now;

      // Start transaction
      if (isOverdue) {
        // Calculate fine amount ($0.50 per day overdue)
        const daysOverdue = Math.ceil(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const fineAmount = daysOverdue * 0.5;

        // Create fine record
        await db.createFine(
          loan.user_id,
          loan.id,
          fineAmount,
          `Book returned ${daysOverdue} days late`
        );
      }

      // Update book availability
      await db.updateBook(loan.books.id, {
        available_copies: loan.books.available_copies + 1,
      });

      // Update loan status
      await db.updateLoan(loan.id, {
        status: "RETURNED",
        return_date: now.toISOString(),
      });

      toast.success("Book marked as returned successfully!");
      if (isOverdue) {
        toast.warning("Late return fee has been applied");
      }

      fetchActiveLoans();
    } catch (error) {
      const err = error as Error;
      toast.error(
        err instanceof Error ? err.message : "Failed to process book return"
      );
      console.error(err);
    }
  };

  const studentCount = profiles.filter((p) => p.role === "STUDENT").length;
  const staffCount = profiles.filter((p) => p.role === "STAFF").length;
  const adminCount = profiles.filter((p) => p.role === "ADMIN").length;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground text-base">
                Welcome back, {user?.full_name}! System administration and control center.
              </p>
            </div>
            <div className="hidden md:block p-4 rounded-2xl bg-primary/10">
              <Settings className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-strong border-2 border-white/60 hover:border-primary/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-primary/15 border-2 border-primary/30">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-foreground">{profiles.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-strong border-2 border-white/60 hover:border-success/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-success/15 border-2 border-success/30">
                <Users className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Students
                </p>
                <p className="text-3xl font-bold text-foreground">{studentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-strong border-2 border-white/60 hover:border-warning/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-warning/15 border-2 border-warning/30">
                <Users className="h-7 w-7 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Staff
                </p>
                <p className="text-3xl font-bold text-foreground">{staffCount}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-strong border-2 border-white/60 hover:border-destructive/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-destructive/15 border-2 border-destructive/30">
                <Users className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Admins
                </p>
                <p className="text-3xl font-bold text-foreground">{adminCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-strong border-2 border-white/60 p-1.5 h-auto flex-wrap">
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm md:text-base font-medium px-4 md:px-6 py-2.5 rounded-xl transition-all"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="staff"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm md:text-base font-medium px-4 md:px-6 py-2.5 rounded-xl transition-all"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger 
              value="loans"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm md:text-base font-medium px-4 md:px-6 py-2.5 rounded-xl transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm md:text-base font-medium px-4 md:px-6 py-2.5 rounded-xl transition-all"
            >
              <BookPlus className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm md:text-base font-medium px-4 md:px-6 py-2.5 rounded-xl transition-all"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  User Management
                </h3>
                <Button
                  onClick={() => setUserDialog({ open: true, mode: 'create' })}
                  className="btn-primary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New User
                </Button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className="glass-strong border-2 border-white/70 p-5 flex justify-between items-center hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-lg text-foreground">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-primary/12 text-primary border-primary/25 font-medium px-3 py-1">
                        {profile.role}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUserDialog({
                            open: true,
                            mode: 'edit',
                            user: profile,
                          })}
                          className="btn-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({
                            open: true,
                            type: 'user',
                            id: profile.id,
                            name: profile.full_name,
                          })}
                          className="btn-destructive"
                          disabled={profile.id === user?.id} // Can't delete yourself
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" />
                Staff Overview
              </h3>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      fetchProfiles();
                      fetchActiveLoans();
                    }}
                    className="btn-secondary"
                  >
                    Reload
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing staff members only
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {profiles
                  .filter((p) => (p.role || "").toUpperCase() === "STAFF")
                  .map((staff) => {
                    // compute staff metrics - only active loans count
                    const active = activeLoans.filter(
                      (l) => l.profiles?.id === staff.id && l.status === "ACTIVE"
                    ).length;

                    return (
                      <Card key={staff.id} className="glass p-4 border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-16">
                            <div className="book-image-container">
                              {/* placeholder avatar/icon */}
                              <UserCheck className="book-image-placeholder" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{staff.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {staff.email}
                            </p>
                            <div className="mt-2">
                              <Badge variant="secondary">
                                Active Loans: {active}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>

              {profiles.filter(
                  (p) => (p.role || "").toUpperCase() === "STAFF"
                ).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No staff found. Try reloading or create a staff user from
                    the Users tab.
                  </div>
                )}
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Active Loans</h3>
              {activeLoans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active loans
                </p>
              ) : (
                <div className="space-y-3">
                  {activeLoans.map((loan) => {
                    const dueDate = new Date(loan.due_date);
                    const isOverdue = dueDate < new Date();
                    return (
                      <Card key={loan.id} className="glass p-4 border-0">
                        <div className="flex gap-4">
                          {/* Book Cover */}
                          <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden">
                            {loan.books?.cover_image_url ? (
                              <img
                                src={loan.books.cover_image_url}
                                alt={`${loan.books.title} cover`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`flex items-center justify-center w-full h-full ${loan.books?.cover_image_url ? 'hidden' : ''}`}>
                              <BookOpen className="w-8 h-8 text-primary/30" />
                            </div>
                          </div>
                          
                          {/* Book Details */}
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {loan.books?.title || 'Unknown Book'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {loan.books?.author || 'Unknown Author'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Borrowed by: {loan.profiles?.full_name || 'Unknown'} (
                              {loan.profiles?.email || 'N/A'})
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4" />
                              <span
                                className={
                                  isOverdue
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }
                              >
                                Due: {dueDate.toLocaleDateString()}
                              </span>
                              {isOverdue && (
                                <Badge variant="destructive">
                                  {Math.ceil(
                                    (Date.now() - dueDate.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )}{" "}
                                  days overdue
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Button
                              size="sm"
                              onClick={() => handleBookReturn(loan)}
                              className="btn-success text-white shadow-sm"
                            >
                              <BookCheck className="h-4 w-4 mr-1" />
                              Mark as Returned
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Book Inventory</h3>
                <Button
                  onClick={() => setBookDialog({ open: true, mode: 'create' })}
                  className="btn-primary"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add New Book
                </Button>
              </div>

              {books.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No books in inventory</p>
              ) : (
                <div className="space-y-3">
                  {books.map((book) => (
                    <Card key={book.id} className="glass p-4 border-0">
                      <div className="flex gap-4">
                        {/* Book Cover */}
                        <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt={`${book.title} cover`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center w-full h-full ${book.cover_image_url ? 'hidden' : ''}`}>
                            <BookOpen className="w-8 h-8 text-primary/30" />
                          </div>
                        </div>
                        
                        {/* Book Details */}
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {book.author} — <span className="font-mono">{book.isbn}</span>
                          </p>
                          {book.genre && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {book.genre}
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            Copies: {book.available_copies}/{book.total_copies}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBookDialog({ open: true, mode: 'edit', book })}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialog({ 
                              open: true, 
                              type: 'book', 
                              id: book.id, 
                              name: book.title 
                            })}
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                System Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="loan-period">
                    Default Loan Period (days)
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="loan-period"
                      type="number"
                      value={settings.loan_period_days || "14"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          loan_period_days: e.target.value,
                        })
                      }
                      className="glass max-w-xs"
                    />
                    <Button
                      onClick={() =>
                        updateSetting(
                          "loan_period_days",
                          settings.loan_period_days
                        )
                      }
                      variant="outline"
                      className="btn-secondary"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="fine-rate">Fine Rate ($ per day)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="fine-rate"
                      type="number"
                      step="0.1"
                      value={settings.fine_rate_per_day || "0.50"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fine_rate_per_day: e.target.value,
                        })
                      }
                      className="glass max-w-xs"
                    />
                    <Button
                      onClick={() =>
                        updateSetting(
                          "fine_rate_per_day",
                          settings.fine_rate_per_day
                        )
                      }
                      variant="outline"
                      className="btn-secondary"
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="max-renewals">Maximum Renewals</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="max-renewals"
                      type="number"
                      value={settings.max_renewals || "2"}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          max_renewals: e.target.value,
                        })
                      }
                      className="glass max-w-xs"
                    />
                    <Button
                      onClick={() =>
                        updateSetting("max_renewals", settings.max_renewals)
                      }
                      variant="outline"
                      className="btn-secondary"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <UserDialog
          open={userDialog.open}
          onOpenChange={(open) => setUserDialog({ ...userDialog, open })}
          onSubmit={handleUserSubmit}
          user={userDialog.user}
          mode={userDialog.mode}
        />

        <BookDialog
          open={bookDialog.open}
          onOpenChange={(open) => setBookDialog({ ...bookDialog, open })}
          onSubmit={handleBookSubmit}
          book={bookDialog.book}
          mode={bookDialog.mode}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          onConfirm={deleteDialog.type === 'user' ? handleDeleteUser : handleDeleteBook}
          title={`Delete ${deleteDialog.type === 'user' ? 'User' : 'Book'}`}
          description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
}
