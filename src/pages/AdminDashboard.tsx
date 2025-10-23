import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, BarChart3, Settings } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [settings, setSettings] = useState({ loanPeriod: 14, fineRate: 0.5 });

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const createUser = async () => {
    try {
      await api.post('/users', newUser);
      toast.success('User created successfully!');
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const updateSettings = async () => {
    try {
      await api.patch('/settings', settings);
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Header */}
        <div className="glass-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage users, configure system settings, and view analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'STUDENT').length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'STAFF').length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-0">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="glass-strong">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary" />
                Create New User
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="glass"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="glass"
                />
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createUser} className="mt-4 bg-primary hover:bg-primary-hover">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>

            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">All Users</h3>
              <div className="space-y-2">
                {users.map((user) => (
                  <Card key={user.id} className="glass p-4 border-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium glass">
                      {user.role}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Reports & Analytics
              </h3>
              <p className="text-muted-foreground mb-6">Generate and view library usage reports</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <span className="text-lg">Overdue Books Report</span>
                  <span className="text-xs text-muted-foreground">View all overdue items</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <span className="text-lg">Popular Books</span>
                  <span className="text-xs text-muted-foreground">Most borrowed books</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <span className="text-lg">Fine Collections</span>
                  <span className="text-xs text-muted-foreground">Revenue from fines</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <span className="text-lg">User Activity</span>
                  <span className="text-xs text-muted-foreground">Borrowing patterns</span>
                </Button>
              </div>
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
                  <label className="block text-sm font-medium mb-2">Default Loan Period (days)</label>
                  <Input
                    type="number"
                    value={settings.loanPeriod}
                    onChange={(e) => setSettings({ ...settings, loanPeriod: parseInt(e.target.value) || 14 })}
                    className="glass max-w-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fine Rate ($ per day)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.fineRate}
                    onChange={(e) => setSettings({ ...settings, fineRate: parseFloat(e.target.value) || 0.5 })}
                    className="glass max-w-xs"
                  />
                </div>
                <Button onClick={updateSettings} className="bg-primary hover:bg-primary-hover">
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
