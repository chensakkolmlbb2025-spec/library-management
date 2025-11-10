import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Package,
  BookOpen,
  UserCheck,
  BookPlus,
  BookCheck,
  Clock,
  RotateCcw,
} from "lucide-react";
import { db } from "@/lib/database";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { RejectBorrowDialog } from "@/components/RejectBorrowDialog";
import { BookDialog } from "@/components/BookDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  available_copies: number;
  total_copies: number;
  cover_image_url?: string;
}

interface BorrowRequest {
  id: string;
  user_id: string;
  request_date: string;
  processed_date: string | null;
  processed_by: string | null;
  status: string;
  profiles: Profile | null;
  books: Book | null;
}

interface Loan {
  id: string;
  user_id: string;
  book_id: string;
  due_date: string;
  return_date: string | null;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  profiles: Profile | null;
  books: Book | null;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    requestId: string;
    borrowerName: string;
    bookTitle: string;
  }>({
    open: false,
    requestId: '',
    borrowerName: '',
    bookTitle: '',
  });
  const [returnDialog, setReturnDialog] = useState<{
    open: boolean;
    loanId: string;
    bookTitle: string;
  }>({
    open: false,
    loanId: '',
    bookTitle: '',
  });
  const [bookDialog, setBookDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    book?: any;
  }>({
    open: false,
    mode: 'create',
  });

  const fetchRequests = useCallback(async () => {
    try {
      const data = await db.getBorrowRequestsWithDetails();
      setRequests(data || []);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch requests:", err);
      toast.error("Failed to fetch borrow requests");
    }
  }, []);

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

      setActiveLoans(transformedLoans);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch active loans:", err);
      toast.error("Failed to fetch active loans");
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchActiveLoans();
  }, [fetchRequests, fetchActiveLoans]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }

      const result = await db.approveBorrowRequest(requestId, user.id);
      
      if (!result.success) {
        toast.error(result.error || "Failed to approve request");
        return;
      }

      toast.success("Borrow request approved successfully!");
      await fetchRequests();
      await fetchActiveLoans();
    } catch (error) {
      const err = error as Error;
      console.error("Error approving request:", err);
      toast.error(err.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (reason: string) => {
    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }

      const success = await db.rejectBorrowRequest(
        rejectDialog.requestId,
        user.id,
        reason
      );

      if (!success) {
        toast.error("Failed to reject request");
        return;
      }

      toast.success("Borrow request rejected");
      await fetchRequests();
    } catch (error) {
      const err = error as Error;
      console.error("Error rejecting request:", err);
      toast.error(err.message || "Failed to reject request");
    }
  };

  const handleReturnBook = async () => {
    try {
      const result = await db.returnBook(returnDialog.loanId);

      if (!result.success) {
        toast.error(result.error || "Failed to process return");
        return;
      }

      if (result.fine) {
        toast.success(
          `Book returned successfully! Fine assessed: $${result.fine.amount.toFixed(2)}`,
          { duration: 5000 }
        );
      } else {
        toast.success("Book returned successfully!");
      }

      await fetchActiveLoans();
      await fetchRequests();
    } catch (error) {
      const err = error as Error;
      console.error("Error returning book:", err);
      toast.error(err.message || "Failed to process return");
    }
  };

  const handleAddBook = async (bookData: any) => {
    try {
      await db.addBook(bookData);
      toast.success("Book added successfully!");
      // Optionally refresh book list if you add that feature
    } catch (error) {
      const err = error as Error;
      console.error("Error adding book:", err);
      toast.error(err.message || "Failed to add book");
    }
  };

  const handleBookReturn = async (loan: Loan) => {
    setReturnDialog({
      open: true,
      loanId: loan.id,
      bookTitle: loan.books?.title || 'Unknown Book',
    });
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedToday = requests.filter(
    (r) =>
      r.status !== "PENDING" &&
      new Date(r.request_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Staff Dashboard
              </h2>
              <p className="text-muted-foreground text-base">
                Welcome back, {user?.full_name}! Manage library operations efficiently.
              </p>
            </div>
            <div className="hidden md:block p-4 rounded-2xl bg-primary/10">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-strong border-2 border-white/60 hover:border-warning/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-warning/15 border-2 border-warning/30">
                <Package className="h-7 w-7 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-foreground">{pendingRequests.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-strong border-2 border-white/60 hover:border-success/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-success/15 border-2 border-success/30">
                <UserCheck className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Processed Today
                </p>
                <p className="text-3xl font-bold text-foreground">{processedToday}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-strong border-2 border-white/60 hover:border-primary/40 transition-all shadow-lg">
            <div className="flex items-center gap-4 p-5">
              <div className="p-4 rounded-2xl bg-primary/15 border-2 border-primary/30">
                <BookPlus className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Active Loans
                </p>
                <p className="text-3xl font-bold text-foreground">{activeLoans.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="glass-strong border-2 border-white/60 p-1.5 h-auto">
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-base font-medium px-6 py-2.5 rounded-xl transition-all"
            >
              <Package className="h-4 w-4 mr-2" />
              Borrow Requests
            </TabsTrigger>
            <TabsTrigger 
              value="loans"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-base font-medium px-6 py-2.5 rounded-xl transition-all"
            >
              <Clock className="h-4 w-4 mr-2" />
              Active Loans
            </TabsTrigger>
            <TabsTrigger 
              value="inventory"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-base font-medium px-6 py-2.5 rounded-xl transition-all"
            >
              <BookPlus className="h-4 w-4 mr-2" />
              Manage Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-warning" />
                  Pending Borrow Requests
                </h3>
                <Badge variant="secondary" className="bg-warning/15 text-warning border-warning/30 text-base px-3 py-1">
                  {pendingRequests.length} Pending
                </Badge>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 bg-muted/5 rounded-xl border-2 border-dashed border-muted/30">
                  <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-lg">No pending requests</p>
                  <p className="text-muted-foreground/70 text-sm mt-1">New requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="glass-strong border-2 border-white/70 hover:border-primary/30 transition-all p-5 shadow-md">
                      <div className="flex gap-5">
                        {/* Book Cover */}
                        <div className="flex-shrink-0 w-20 h-28 bg-gradient-to-br from-primary/15 to-primary/5 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm">
                          {request.books?.cover_image_url ? (
                            <img
                              src={request.books.cover_image_url}
                              alt={`${request.books.title} cover`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`flex items-center justify-center w-full h-full ${request.books?.cover_image_url ? 'hidden' : ''}`}>
                            <BookOpen className="w-10 h-10 text-primary/40" />
                          </div>
                        </div>
                        
                        {/* Book Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg text-foreground mb-1 truncate">
                            {request.books?.title || 'Unknown Book'}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            by {request.books?.author || 'Unknown Author'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <Badge variant="secondary" className="bg-primary/12 text-primary border-primary/25 font-medium">
                              Student: {request.profiles?.full_name || 'Unknown'}
                            </Badge>
                            <Badge variant="secondary" className="bg-muted/30 text-muted-foreground border-muted/40 font-medium">
                              Requested: {new Date(request.request_date).toLocaleDateString()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              className="btn-success text-white shadow-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectDialog({
                                open: true,
                                requestId: request.id,
                                borrowerName: request.profiles?.full_name || 'Unknown',
                                bookTitle: request.books?.title || 'Unknown Book',
                              })}
                              className="btn-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Active Loans
                </h3>
                <Badge variant="secondary" className="bg-primary/12 text-primary border-primary/25 text-base px-3 py-1">
                  {activeLoans.length} Active
                </Badge>
              </div>
              {activeLoans.length === 0 ? (
                <div className="text-center py-12 bg-muted/5 rounded-xl border-2 border-dashed border-muted/30">
                  <Clock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground text-lg">No active loans</p>
                  <p className="text-muted-foreground/70 text-sm mt-1">Checked out books will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeLoans.map((loan) => {
                    const dueDate = new Date(loan.due_date);
                    const isOverdue = dueDate < new Date();
                    return (
                      <Card key={loan.id} className={`glass-strong border-2 ${isOverdue ? 'border-destructive/40 bg-destructive/5' : 'border-white/70'} hover:border-primary/30 transition-all p-5 shadow-md`}>
                        <div className="flex gap-5">
                          {/* Book Cover */}
                          <div className="flex-shrink-0 w-20 h-28 bg-gradient-to-br from-primary/15 to-primary/5 rounded-lg overflow-hidden border-2 border-primary/20 shadow-sm">
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
                              <BookOpen className="w-10 h-10 text-primary/40" />
                            </div>
                          </div>
                          
                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg text-foreground mb-1 truncate">
                              {loan.books?.title || 'Unknown Book'}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              by {loan.books?.author || 'Unknown Author'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <Badge variant="secondary" className="bg-primary/12 text-primary border-primary/25 font-medium">
                                Borrower: {loan.profiles?.full_name || 'Unknown'}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={isOverdue 
                                  ? "bg-destructive/15 text-destructive border-destructive/30 font-medium animate-pulse" 
                                  : "bg-muted/30 text-muted-foreground border-muted/40 font-medium"
                                }
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {dueDate.toLocaleDateString()}
                                {isOverdue && " (OVERDUE)"}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleBookReturn(loan)}
                              className="btn-success text-white shadow-sm"
                            >
                              <BookCheck className="h-4 w-4 mr-1.5" />
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

          <TabsContent value="inventory" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6 border-2 border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <BookPlus className="h-6 w-6 text-success" />
                  Book Management
                </h3>
                <Button
                  onClick={() => setBookDialog({ open: true, mode: 'create' })}
                  className="btn-primary"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add New Book
                </Button>
              </div>
              <div className="text-center py-12 bg-muted/5 rounded-xl border-2 border-dashed border-muted/30">
                <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-lg">Click "Add New Book" to add books to the library</p>
                <p className="text-muted-foreground/70 text-sm mt-1">You can add title, author, ISBN, cover image URL, and more</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <RejectBorrowDialog
          open={rejectDialog.open}
          onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
          onConfirm={handleRejectRequest}
          borrowerName={rejectDialog.borrowerName}
          bookTitle={rejectDialog.bookTitle}
        />

        <ConfirmDialog
          open={returnDialog.open}
          onOpenChange={(open) => setReturnDialog({ ...returnDialog, open })}
          onConfirm={handleReturnBook}
          title="Confirm Book Return"
          description={`Are you sure you want to mark "${returnDialog.bookTitle}" as returned? Fine will be automatically calculated if the book is overdue.`}
          confirmText="Mark as Returned"
        />

        <BookDialog
          open={bookDialog.open}
          onOpenChange={(open) => setBookDialog({ ...bookDialog, open })}
          onSubmit={handleAddBook}
          mode={bookDialog.mode}
        />
      </div>
    </Layout>
  );
}
