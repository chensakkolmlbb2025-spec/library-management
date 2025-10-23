import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Package, UserCheck, BookPlus } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface BorrowRequest {
  id: string;
  student: { name: string; email: string };
  book: { title: string; author: string };
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function StaffDashboard() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', copies: 1 });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests');
    }
  };

  const handleRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/requests/${requestId}/${action}`);
      toast.success(`Request ${action}d successfully!`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const addBook = async () => {
    try {
      await api.post('/books', newBook);
      toast.success('Book added successfully!');
      setNewBook({ title: '', author: '', isbn: '', copies: 1 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add book');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

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
                <p className="text-2xl font-bold">
                  {requests.filter(r => r.status !== 'PENDING').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BookPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Books in System</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="glass-strong">
            <TabsTrigger value="requests">Borrow Requests</TabsTrigger>
            <TabsTrigger value="inventory">Manage Inventory</TabsTrigger>
            <TabsTrigger value="checkout">Check-Out/In</TabsTrigger>
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
                          <h4 className="font-semibold">{request.book.title}</h4>
                          <p className="text-sm text-muted-foreground">{request.book.author}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Requested by: {request.student.name} ({request.student.email})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Date: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRequest(request.id, 'approve')}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequest(request.id, 'reject')}
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
                  placeholder="Book Title"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Author"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="ISBN"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  className="glass"
                />
                <Input
                  type="number"
                  placeholder="Number of Copies"
                  value={newBook.copies}
                  onChange={(e) => setNewBook({ ...newBook, copies: parseInt(e.target.value) || 1 })}
                  className="glass"
                />
              </div>
              <Button onClick={addBook} className="mt-4 bg-primary hover:bg-primary-hover">
                <BookPlus className="h-4 w-4 mr-2" />
                Add Book to Library
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="checkout">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Check-Out / Check-In</h3>
              <p className="text-muted-foreground">Scan or search for books and users to process checkouts and returns</p>
              <div className="mt-6 space-y-4">
                <Input placeholder="Scan or enter Book ISBN..." className="glass" />
                <Input placeholder="Scan or enter Student ID..." className="glass" />
                <div className="flex gap-2">
                  <Button className="bg-primary hover:bg-primary-hover flex-1">Check Out</Button>
                  <Button variant="outline" className="flex-1">Check In</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
