import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Package, UserCheck, BookPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface BorrowRequest {
  id: string;
  request_date: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
  books: {
    title: string;
    author: string;
  };
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [newBook, setNewBook] = useState({ 
    title: '', 
    author: '', 
    isbn: '', 
    genre: '',
    description: '',
    total_copies: 1,
    available_copies: 1
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*, profiles!borrow_requests_user_id_fkey(full_name, email), books(title, author)')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .update({ 
          status: action,
          processed_date: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success(`Request ${action.toLowerCase()} successfully!`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action.toLowerCase()} request`);
    }
  };

  const addBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .insert([{
          ...newBook,
          available_copies: newBook.total_copies
        }]);

      if (error) throw error;
      
      toast.success('Book added successfully!');
      setNewBook({ 
        title: '', 
        author: '', 
        isbn: '', 
        genre: '',
        description: '',
        total_copies: 1,
        available_copies: 1
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('A book with this ISBN already exists');
      } else {
        toast.error(error.message || 'Failed to add book');
      }
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedToday = requests.filter(r => 
    r.status !== 'PENDING' && 
    new Date(r.request_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">Staff Dashboard</h2>
          <p className="text-muted-foreground">Manage requests, inventory, and library operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Package className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processed Today</p>
                <p className="text-2xl font-bold">{processedToday}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BookPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="glass-strong">
            <TabsTrigger value="requests">Borrow Requests</TabsTrigger>
            <TabsTrigger value="inventory">Manage Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Pending Borrow Requests</h3>
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="glass p-4 border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{request.books.title}</h4>
                          <p className="text-sm text-muted-foreground">{request.books.author}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Requested by: {request.profiles.full_name} ({request.profiles.email})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Date: {new Date(request.request_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequest(request.id, 'APPROVED')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequest(request.id, 'REJECTED')}
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Add New Book</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Book Title *"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Author *"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="ISBN *"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Genre"
                  value={newBook.genre}
                  onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="glass md:col-span-2"
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Number of Copies"
                  value={newBook.total_copies}
                  onChange={(e) => setNewBook({ 
                    ...newBook, 
                    total_copies: parseInt(e.target.value) || 1,
                    available_copies: parseInt(e.target.value) || 1
                  })}
                  className="glass"
                />
              </div>
              <Button onClick={addBook} className="mt-4 bg-primary hover:bg-primary-hover">
                <BookPlus className="h-4 w-4 mr-2" />
                Add Book to Library
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
