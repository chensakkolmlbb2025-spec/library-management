import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Calendar, DollarSign, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  totalCopies: number;
}

interface Loan {
  id: string;
  book: Book;
  dueDate: string;
  overdue: boolean;
}

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [fines, setFines] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLoans();
    fetchFines();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await api.get('/user/loans');
      setLoans(response.data);
    } catch (error) {
      console.error('Failed to fetch loans');
    }
  };

  const fetchFines = async () => {
    try {
      const response = await api.get('/user/fines');
      setFines(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch fines');
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await api.get('/books', { params: { search: searchQuery } });
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to search books');
    } finally {
      setIsLoading(false);
    }
  };

  const requestBorrow = async (bookId: string) => {
    try {
      await api.post('/borrow-requests', { bookId });
      toast.success('Borrow request submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">Student Portal</h2>
          <p className="text-muted-foreground">Browse books, manage loans, and track your library activity</p>
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
                <p className="text-2xl font-bold">{loans.filter(l => l.overdue).length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Fines</p>
                <p className="text-2xl font-bold">${fines.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Books */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Search Library Catalog</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
                className="pl-10 glass"
              />
            </div>
            <Button onClick={searchBooks} disabled={isLoading} className="bg-primary hover:bg-primary-hover">
              Search
            </Button>
          </div>

          {/* Search Results */}
          {books.length > 0 && (
            <div className="mt-6 space-y-3">
              {books.map((book) => (
                <Card key={book.id} className="glass p-4 border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <p className="text-xs text-muted-foreground mt-1">ISBN: {book.isbn}</p>
                      <div className="mt-2">
                        <Badge variant={book.availableCopies > 0 ? 'default' : 'destructive'}>
                          {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Not Available'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => requestBorrow(book.id)}
                      disabled={book.availableCopies === 0}
                      size="sm"
                      className="bg-primary hover:bg-primary-hover"
                    >
                      Request Borrow
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Current Loans */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">My Current Loans</h3>
          {loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active loans</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <Card key={loan.id} className="glass p-4 border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{loan.book.title}</h4>
                      <p className="text-sm text-muted-foreground">{loan.book.author}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className={loan.overdue ? 'text-destructive' : 'text-muted-foreground'}>
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </span>
                        {loan.overdue && <Badge variant="destructive">Overdue</Badge>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Renew
                    </Button>
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
