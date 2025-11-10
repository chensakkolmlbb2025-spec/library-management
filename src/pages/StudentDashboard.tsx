import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, DollarSign, Clock } from "lucide-react";
import { db, type Book } from "@/lib/database";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Loan {
  id: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  books: Book;
}

interface BorrowRequest {
  id: string;
  book_id: string;
  user_id: string;
  status: string;
  notes: string;
  request_date: string;
  processed_date: string;
  processed_by: string;
  created_at: string;
  books: Book; // Changed from 'book' to 'books' to match database return
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fines, setFines] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);

  const fetchBorrowRequests = useCallback(async () => {
    try {
      const requests = await db.getBorrowRequestsWithDetails();
      const userRequests = requests.filter(
        (r: any) => r.user_id === user?.id && r.status === 'PENDING'
      );
      setBorrowRequests(userRequests || []);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch borrow requests:", err);
    }
  }, [user?.id]);

  // Book catalog and search moved to Home page

  const fetchLoans = useCallback(async () => {
    try {
      const loansData = await db.getLoansWithDetails();
      const userLoans = loansData.filter(
        (l: any) => l.user_id === user?.id && ['ACTIVE', 'OVERDUE'].includes(l.status)
      );
      setLoans(userLoans || []);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    }
  }, [user?.id]);

  const fetchFines = useCallback(async () => {
    try {
      const finesData = await db.getFines({ userId: user?.id, paid: false });
      const total = finesData.reduce((sum, fine) => sum + Number(fine.amount), 0);
      setFines(total);
    } catch (error) {
      console.error("Failed to fetch fines:", error);
    }
  }, [user?.id]);

  const fetchLoanHistory = useCallback(async () => {
    try {
      const loansData = await db.getLoansWithDetails();
      const userHistory = loansData
        .filter((l: any) => l.user_id === user?.id && l.status === 'RETURNED')
        .sort((a: any, b: any) => {
          const dateA = a.return_date ? new Date(a.return_date).getTime() : 0;
          const dateB = b.return_date ? new Date(b.return_date).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 50);
      setLoanHistory(userHistory || []);
    } catch (error) {
      const err = error as Error;
      console.error("Failed to fetch loan history:", err);
    }
  }, [user?.id]);

  // Borrow request function moved to Home page

  useEffect(() => {
    fetchLoans();
    fetchFines();
    fetchBorrowRequests();
    fetchLoanHistory();
  }, [fetchLoans, fetchFines, fetchBorrowRequests, fetchLoanHistory]);

  const overdueLoans = loans.filter(
    (l) => l.status === "OVERDUE" || new Date(l.due_date) < new Date()
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Student Portal
          </h2>
          <p className="text-muted-foreground">
            Browse books, manage loans, and track your library activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{loans.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
                <p className="text-2xl font-bold">{overdueLoans.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Outstanding Fines
                </p>
                <p className="text-2xl font-bold">${fines.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Borrow Requests */}
        {borrowRequests.length > 0 && (
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Pending Borrow Requests</h3>
            <div className="space-y-3">
              {borrowRequests.map((request) => (
                <Card key={request.id} className="glass p-4 border-0">
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden">
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
                        <BookOpen className="w-8 h-8 text-primary/30" />
                      </div>
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {request.books?.title || 'Unknown Book'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.books?.author || 'Unknown Author'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">Pending Approval</Badge>
                        <span className="text-sm text-muted-foreground">
                          Requested:{" "}
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Library Catalog moved to Home page */}

        {/* Current Loans */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">My Current Loans</h3>
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active loans
            </p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => {
                const isOverdue = new Date(loan.due_date) < new Date();
                return (
                  <Card key={loan.id} className="glass p-4 border-0">
                    <div className="flex gap-4">
                      {/* Book Cover */}
                      <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden">
                        {loan.books.cover_image_url ? (
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
                        <div className={`flex items-center justify-center w-full h-full ${loan.books.cover_image_url ? 'hidden' : ''}`}>
                          <BookOpen className="w-8 h-8 text-primary/30" />
                        </div>
                      </div>
                      
                      {/* Book Details */}
                      <div className="flex-1">
                        <h4 className="font-semibold">{loan.books.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {loan.books.author}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span
                            className={
                              isOverdue
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            }
                          >
                            Due: {new Date(loan.due_date).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Borrow History */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Borrow History</h3>
          {loanHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No past loans
            </p>
          ) : (
            <div className="space-y-3">
              {loanHistory.map((loan) => (
                <Card key={loan.id} className="glass p-4 border-0">
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0 w-16 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded overflow-hidden">
                      {loan.books.cover_image_url ? (
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
                      <div className={`flex items-center justify-center w-full h-full ${loan.books.cover_image_url ? 'hidden' : ''}`}>
                        <BookOpen className="w-8 h-8 text-primary/30" />
                      </div>
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1">
                      <h4 className="font-semibold">{loan.books.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {loan.books.author}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Returned:{" "}
                        {loan.return_date
                          ? new Date(loan.return_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Returned</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
